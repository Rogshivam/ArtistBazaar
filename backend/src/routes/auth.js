import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import axios from "axios";
import User from "../models/User.js";
import { signToken, signRefreshToken } from "../utils/auth.js";

const r = Router();

const googleSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  role: z.enum(["Customer", "Seller", "Services", "Admin"]).optional().default("Customer"),
});

r.post("/google/callback", async (req, res) => {
  try {
    console.log("Received request to /api/auth/google/callback:", req.body);
    const { code, role } = googleSchema.parse(req.body);

    // Validate environment variables
    if (!process.env.API_URL) {
      console.error("Missing API_URL in environment variables");
      return res.status(500).json({ message: "Server configuration error: API_URL not set" });
    }
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error("Missing Google OAuth credentials in environment variables");
      return res.status(500).json({ message: "Server configuration error: Google OAuth credentials not set" });
    }

    const redirectUri = `${process.env.API_URL}/google/callback`.replace(/\/$/, ""); // Remove trailing slash
    console.log("Using redirect_uri:", redirectUri);

    // Log the full token exchange payload
    const tokenPayload = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };
    console.log("Token exchange payload:", tokenPayload);

    // Exchange authorization code for tokens
    const tokenResponse = await axios
      .post("https://oauth2.googleapis.com/token", tokenPayload, {
        headers: { "Content-Type": "application/json" },
      })
      .catch((error) => {
        console.error("Token exchange error:", JSON.stringify(error.response?.data, null, 2));
        if (error.response?.status === 400) {
          return res.status(400).json({
            message: `Token exchange failed: ${error.response?.data?.error || "Bad Request"}`,
            details: error.response?.data?.error_description || "No additional details provided",
          });
        }
        throw error;
      });

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      console.error("No access_token in token response:", tokenResponse.data);
      return res.status(400).json({ message: "Token exchange failed: No access token received" });
    }
    console.log("Token exchange successful, access_token:", access_token);

    // Fetch user info
    const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    }).catch((error) => {
      console.error("User info fetch error:", JSON.stringify(error.response?.data, null, 2));
      throw new Error("Failed to fetch user info from Google");
    });

    const { email, name, picture, sub: googleId } = userInfoResponse.data;
    console.log("User info received:", { email, name, googleId, picture });

    if (!email || !name || !googleId) {
      console.error("Missing required fields in user info:", userInfoResponse.data);
      return res.status(400).json({ message: "Missing required fields from Google: email, name, or googleId" });
    }

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        if (role && role !== user.role) {
          return res.status(400).json({
            message: `Selected role (${role}) does not match existing account role (${user.role})`,
          });
        }
      } else {
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
        console.log("Created new user:", user);
      }
    } else if (role && role !== user.role) {
      return res.status(400).json({
        message: `Selected role (${role}) does not match existing account role (${user.role})`,
      });
    }

    user.name = name;
    user.avatar = picture || user.avatar;
    user.lastLogin = new Date();
    await user.save();
    console.log("Updated user:", user);

    const token = signToken({ id: String(user._id), role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ id: String(user._id), role: user.role, email: user.email });

    return res.json({
      authToken: token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      message: "Google signup successful",
    });
  } catch (e) {
    console.error("Google callback error:", e);
    return res.status(500).json({ message: e.message || "Google signup failed" });
  }
});

// Logout
r.post("/logout", (req, res) => {
  return res.json({ message: "Logged out successfully" });
});

export default r;