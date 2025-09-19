// import express from "express";
// import Sale from "../models/Sale.js";
// import Product from "../models/Product.js";
// import authMiddleware from "../middleware/authMiddleware.js"; // assuming you already have auth

// const router = express.Router();

// // ✅ Recent Sales
// router.get("/recent-sales", authMiddleware, async (req, res) => {
//   try {
//     const sellerId = req.user.id; // from auth middleware
//     const sales = await Sale.find({ sellerId })
//       .sort({ createdAt: -1 })
//       .limit(5); // latest 5 sales
//     res.json({ items: sales });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Top Products
// router.get("/top-products", authMiddleware, async (req, res) => {
//   try {
//     const sellerId = req.user.id;
//     const products = await Product.find({ sellerId })
//       .sort({ revenue: -1 })
//       .limit(5); // top 5 by revenue

//     res.json({ items: products });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
// backend/src/routes/sellerRoutes.js
// routes/sellerRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProducts,
  getRecentSales,
  getTopProducts,
} from "../controllers/sellerController.js";

const router = express.Router();

// All routes under /api/seller
router.get("/products", protect, getProducts);
router.get("/recent-sales", protect, getRecentSales);
router.get("/top-products", protect, getTopProducts);

export default router;

