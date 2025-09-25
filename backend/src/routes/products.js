import { Router } from "express";
import { z } from "zod";
import Product from "../models/Product.js";
import { requireAuth } from "../utils/auth.js";

function normalizeImages(p) {
  if (!p) return [];
  // Prefer explicit primary image (`image`) as the first element if available
  const fromImages = Array.isArray(p.images) && p.images.length ? [...p.images] : [];
  const fromImagesData = Array.isArray(p.imagesData) && p.imagesData.length ? p.imagesData.map((x) => x?.url).filter(Boolean) : [];
  let out = fromImages.length ? fromImages : (fromImagesData.length ? fromImagesData : (p.image ? [p.image] : []));
  if (p.image) {
    // If `image` exists but is not the first element, move it to the front
    out = [p.image, ...out.filter((u) => u && u !== p.image)];
  }
  return out;
}

const r = Router();

r.get("/", async (req, res) => {
  try {
    const { q, category, tags, minPrice, maxPrice, sort = "-createdAt", page = "1", limit = "20" } = req.query;
    const filter = { status: "active" }; // Only show active products
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } }
      ];
    }
    if (category) filter.category = String(category);
    if (tags) filter.tags = { $in: String(tags).split(",") };
    if (minPrice || maxPrice) filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit)) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [docs, total] = await Promise.all([
      Product.find(filter).populate('seller', 'name email').sort(String(sort)).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    const items = docs.map((p) => ({
      ...p.toObject(),
      images: normalizeImages(p),
    }));

    return res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error: error.message });
  }
});

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  price: z.coerce.number().positive(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  image: z.string().url().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

r.post("/", requireAuth(["Seller"]), async (req, res) => {
  try {
    const data = createSchema.parse(req.body);
    const payload = { ...data, seller: req.user.id };
    if ((!payload.image || !payload.image.length) && Array.isArray(payload.images) && payload.images.length) {
      payload.image = payload.images[0];
    }
    const doc = await Product.create(payload);
    return res.status(201).json({ message: "Product created", product: doc });
  } catch (e) {
    return res.status(400).json({ message: e.message || "Invalid product" });
  }
});

r.get("/seller/products", requireAuth(["Seller"]), async (req, res) => {
  try {
    const items = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching seller products", error: error.message });
  }
});

// Get single product by ID
r.get("/:id", async (req, res) => {
  try {
    const productDoc = await Product.findById(req.params.id).populate('seller', 'name email avatar');
    if (!productDoc) {
      return res.status(404).json({ message: "Product not found" });
    }
    const product = { ...productDoc.toObject(), images: normalizeImages(productDoc) };
    return res.json({ product });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching product", error: error.message });
  }
});

// Update product
r.put("/:id", requireAuth(["Seller"]), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }
    
    const data = createSchema.parse(req.body);
    const payload = { ...data };
    if ((!payload.image || !payload.image.length) && Array.isArray(payload.images) && payload.images.length) {
      payload.image = payload.images[0];
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      payload, 
      { new: true, runValidators: true }
    );
    return res.json({ message: "Product updated", product: updatedProduct });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Error updating product" });
  }
});

// Delete product
r.delete("/:id", requireAuth(["Seller"]), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

// Get categories
r.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
});

export default r;


