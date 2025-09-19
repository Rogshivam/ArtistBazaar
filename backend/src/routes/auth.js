import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import axios from "axios";
import User from "../models/User.js";
import { signToken, signRefreshToken } from "../utils/auth.js";

const r = Router();

// ==========================
// SCHEMAS
// ==========================
const googleSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  role: z.enum(["Customer", "Seller", "Services", "Admin"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["Customer", "Seller", "Services", "Admin"]).optional(),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["Customer", "Seller", "Services"]),
});

// ==========================
// SIGNUP
// ==========================
r.post("/signup", async (req, res) => {
  try {
    const { email, name, password, role } = signupSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.googleId) {
        return res.status(400).json({ message: "Account exists via Google. Please log in with Google." });
      }
      return res.status(400).json({ message: "Account already exists. Please log in." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let uniqueName = name;
    let counter = 1;
    while (await User.findOne({ name: uniqueName })) {
      uniqueName = `${name}${counter}`;
      counter++;
    }

    const user = await User.create({
      email,
      name: uniqueName,
      passwordHash,
      role,
      lastLogin: new Date(),
      isActive: true,
    });

    return res.status(201).json({
      message: "Account created successfully! Please log in.",
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("Signup error:", e);
    if (e instanceof z.ZodError) {
      return res.status(400).json({ message: e.errors[0].message });
    }
    return res.status(500).json({ message: e.message || "Signup failed" });
  }
});

// ==========================
// LOGIN
// ==========================
r.post("/login", async (req, res) => {
  try {
    const { email, password, role } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    if (role && role !== user.role) {
      return res.status(400).json({
        message: `Selected role (${role}) does not match account role (${user.role})`,
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ message: "This account was created via Google. Please log in with Google." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid email or password" });

    user.lastLogin = new Date();
    await user.save();

    const token = signToken({ id: String(user._id), role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ id: String(user._id), role: user.role, email: user.email });

    return res.json({
      authToken: token,
      refreshToken,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      message: "Login successful",
    });
  } catch (e) {
    console.error("Login error:", e);
    if (e instanceof z.ZodError) {
      return res.status(400).json({ message: e.errors[0].message });
    }
    return res.status(500).json({ message: e.message || "Login failed" });
  }
});

// ==========================
// GOOGLE OAUTH CALLBACK
// ==========================
r.get("/google/callback", (req, res) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Authorization code missing or invalid" });
    }
    console.log("Redirecting to frontend with code:", code);
    const frontendCallbackUrl = `${process.env.CLIENT_URL}/google-callback?code=${encodeURIComponent(code)}`;
    return res.redirect(302, frontendCallbackUrl);
  } catch (e) {
    console.error("GET callback error:", e);
    return res.status(500).json({ message: e.message || "Redirect failed" });
  }
});

r.post("/google/callback", async (req, res) => {
  try {
    console.log("Received request to /api/auth/google/callback:", req.body);
    const { code, role } = googleSchema.parse(req.body);

    if (!process.env.CLIENT_URL) {
      return res.status(500).json({ message: "CLIENT_URL not set" });
    }
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ message: "Google OAuth credentials not set" });
    }

    const finalRedirectUri = `${process.env.CLIENT_URL}/api/auth/google/callback`;

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: finalRedirectUri,
        grant_type: "authorization_code",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const { access_token } = tokenResponse.data;
    if (!access_token) return res.status(400).json({ message: "No access token received" });

    const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { email, name, picture, sub: googleId } = userInfoResponse.data;

    if (!email || !name || !googleId) {
      return res.status(400).json({ message: "Missing required fields from Google" });
    }

    let user = await User.findOne({ googleId }) || await User.findOne({ email });

    if (!user) {
      let uniqueName = name;
      let counter = 1;
      while (await User.findOne({ name: uniqueName })) {
        uniqueName = `${name}${counter}`;
        counter++;
      }

      user = await User.create({
        email,
        name: uniqueName,
        avatar: picture || "https://via.placeholder.com/150",
        googleId,
        role: role || "Customer",
        lastLogin: new Date(),
        isActive: true,
      });
    } else if (role && role !== user.role) {
      return res.status(400).json({
        message: `Selected role (${role}) does not match existing account role (${user.role})`,
      });
    }

    user.name = name;
    user.avatar = picture || user.avatar;
    user.lastLogin = new Date();
    await user.save();

    const token = signToken({ id: String(user._id), role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ id: String(user._id), role: user.role, email: user.email });

    return res.json({
      authToken: token,
      refreshToken,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      message: "Google signup/login successful",
    });
  } catch (e) {
    console.error("Google callback error:", e);
    if (e instanceof z.ZodError) {
      return res.status(400).json({ message: e.errors[0].message });
    }
    return res.status(500).json({ message: e.message || "Google login failed" });
  }
});

// ==========================
// LOGOUT
// ==========================
r.post("/logout", (req, res) => {
  return res.json({ message: "Logged out successfully" });
});

export default r;