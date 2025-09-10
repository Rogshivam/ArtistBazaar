import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import User from "../models/User.js";
import { signToken, signRefreshToken } from "../utils/auth.js";

const r = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const setPwdSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });

r.post(["/login", "/login"], async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.passwordHash) return res.status(400).json({ message: "Please use Google sign-in or set a password" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    const token = signToken({ id: String(user._id), role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ id: String(user._id), role: user.role, email: user.email });
    const payload = { 
      authToken: token, 
      refreshToken: refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      message: "Logged in successfully" 
    };
    if (user.role === "Seller") Object.assign(payload, { seller: { id: user._id } });
    if (user.role === "Services") Object.assign(payload, { services: { id: user._id } });
    return res.json(payload);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Login failed" });
  }
});

r.post("/seller/set-password", async (req, res) => {
  // Frontend maps "Student" -> Seller
  try {
    const { email, password, name } = setPwdSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists. Please use a different email or try logging in." });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      role: "Seller",
      passwordHash: hash,
      name: name || "Seller",
      isActive: true
    });
    return res.json({ message: "Seller account created successfully", userId: user._id });
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to create account" });
  }
});
r.post("/service/set-password", async (req, res) => {
  // Frontend maps "Faculty" -> Services
  try {
    const { email, password, name } = setPwdSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists. Please use a different email or try logging in." });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      role: "Services",
      passwordHash: hash,
      name: name || "Services",
      isActive: true
    });
    return res.json({ message: "Services account created successfully", userId: user._id });
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to create account" });
  }
});

r.post("/customer/set-password", async (req, res) => {
  // Customer signup endpoint
  try {
    const { email, password, name } = setPwdSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists. Please use a different email or try logging in." });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      role: "Customer",
      passwordHash: hash,
      name: name || "Customer",
      isActive: true
    });
    return res.json({ message: "Customer account created successfully", userId: user._id });
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to create account" });
  }
});

// Google OAuth routes
r.get("/google", async (req, res) => {
  // This would be handled by passport middleware in a full implementation
  res.json({ message: "Google OAuth endpoint - implement with passport" });
});

r.post("/google/callback", async (req, res) => {
  try {
    const { email, name, avatar, googleId } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { 
        $setOnInsert: { email, role: "Customer", name, avatar, googleId }, 
        $set: { name, avatar, googleId, lastLogin: new Date() } 
      },
      { new: true, upsert: true }
    );
    
    const token = signToken({ id: String(user._id), role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ id: String(user._id), role: user.role, email: user.email });
    
    return res.json({ 
      authToken: token, 
      refreshToken: refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      message: "Google login successful" 
    });
  } catch (e) {
    return res.status(400).json({ message: e.message || "Google login failed" });
  }
});

// Logout
r.post("/logout", async (req, res) => {
  // In a full implementation, you'd blacklist the token
  res.json({ message: "Logged out successfully" });
});

export default r;


