import { Router } from "express";
import { requireAuth } from "../utils/auth.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const r = Router();

r.get("/overview", requireAuth(["Admin"]), async (_req, res) => {
  const totalSellers = await User.countDocuments({ role: "Seller" });
  const totalServices = await User.countDocuments({ role: "Services" });
  const totalProducts = await Product.countDocuments();
  return res.json({ totalSellers, totalServices, totalProducts, anomaliesDetected: 0 });
});

r.get("/sellers", requireAuth(["Admin"]), async (_req, res) => {
  const sellers = await User.find({ role: "Seller" }).select("email createdAt").lean();
  return res.json({ sellers });
});

r.get("/customers", requireAuth(["Admin"]), async (_req, res) => {
  return res.json({ customers: [] });
});

export default r;


