import { Router } from "express";
import { z } from "zod";
import Product from "../models/Product.js";
import { requireAuth } from "../utils/auth.js";

const r = Router();

r.get("/products", async (req, res) => {
  const { q, category, tags, minPrice, maxPrice, sort = "-createdAt", page = "1", limit = "20" } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: String(q) };
  if (category) filter.category = String(category);
  if (tags) filter.tags = { $in: String(tags).split(",") };
  if (minPrice || maxPrice) filter.price = {
    ...(minPrice ? { $gte: Number(minPrice) } : {}),
    ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
  };

  const pageNum = Math.max(1, parseInt(String(page)) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(String(limit)) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Product.find(filter).sort(String(sort)).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);
  return res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  price: z.coerce.number().positive(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

r.post("/products", requireAuth(["Seller"]), async (req, res) => {
  try {
    const data = createSchema.parse(req.body);
    const doc = await Product.create({ ...data, sellerId: req.user.id });
    return res.status(201).json({ message: "Product created", product: doc });
  } catch (e) {
    return res.status(400).json({ message: e.message || "Invalid product" });
  }
});

r.get("/seller/products", requireAuth(["Seller"]), async (req, res) => {
  const items = await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
  return res.json({ items });
});

export default r;


