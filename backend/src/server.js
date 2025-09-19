// // src/server.js
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import authRoutes from "./routes/auth.js";
// import productRoutes from "./routes/products.js";
// import adminRoutes from "./routes/admin.js";
// import cartRoutes from "./routes/cart.js";
// import sellerRoutes from "./routes/sellerRoutes.js";



// // Load environment variables
// dotenv.config();

// const app = express();

// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN || "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization","auth-token"],
//   })
// );

// app.use(express.json());

// app.get("/health", (_req, res) => res.json({ ok: true }));


// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/handle-seller", authRoutes);
// app.use("/api/services", authRoutes);
// app.use("/api", authRoutes);
// app.use("/api", productRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/seller", sellerRoutes);
// app.use("/api/auth", authRoutes);

// const mongo = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/artist_bazaar";
// mongoose
//   .connect(mongo)
//   .then(() => {
//     const port = Number(process.env.PORT) || 4000;
//     app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
//   })
//   .catch((err) => {
//     console.error("Mongo connection error:", err);
//     process.exit(1);
//   });
// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import adminRoutes from "./routes/admin.js";
import cartRoutes from "./routes/cart.js";
import sellerRoutes from "./routes/sellerRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"], // Ensure all headers are allowed
  })
);

app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Mount routes with distinct prefixes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/seller", sellerRoutes); // Correct base path for seller routes

// Remove redundant or conflicting route mounts (e.g., /api/auth multiple times)

const mongo = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/artist_bazaar";
mongoose
  .connect(mongo)
  .then(() => {
    const port = Number(process.env.PORT) || 4000;
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });
