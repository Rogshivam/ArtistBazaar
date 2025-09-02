import { Router } from "express";
import { z } from "zod";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { requireAuth } from "../utils/auth.js";

const r = Router();

const addSchema = z.object({ productId: z.string(), quantity: z.coerce.number().int().positive() });

async function ensureCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
}

r.get("/cart", requireAuth(), async (req, res) => {
  const cart = await ensureCart(req.user.id);
  return res.json(cart);
});

r.post("/cart/add", requireAuth(), async (req, res) => {
  try {
    const { productId, quantity } = addSchema.parse(req.body);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const cart = await ensureCart(req.user.id);
    const idx = cart.items.findIndex((i) => String(i.productId) === String(productId));
    if (idx >= 0) {
      cart.items[idx].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, priceSnapshot: product.price });
    }
    await cart.save();
    return res.json({ message: "Added to cart", cart });
  } catch (e) {
    return res.status(400).json({ message: e.message || "Invalid payload" });
  }
});

r.post("/cart/update", requireAuth(), async (req, res) => {
  try {
    const { productId, quantity } = addSchema.parse(req.body);
    const cart = await ensureCart(req.user.id);
    const idx = cart.items.findIndex((i) => String(i.productId) === String(productId));
    if (idx < 0) return res.status(404).json({ message: "Item not in cart" });
    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }
    await cart.save();
    return res.json({ message: "Cart updated", cart });
  } catch (e) {
    return res.status(400).json({ message: e.message || "Invalid payload" });
  }
});

r.post("/cart/clear", requireAuth(), async (req, res) => {
  const cart = await ensureCart(req.user.id);
  cart.items = [];
  await cart.save();
  return res.json({ message: "Cart cleared", cart });
});

export default r;


