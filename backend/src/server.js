import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import adminRoutes from "./routes/admin.js";
import cartRoutes from "./routes/cart.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "*").split(","),
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/handle-seller", authRoutes);
app.use("/api/services", authRoutes);
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", cartRoutes);

const mongo = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/artist_bazaar";
mongoose
  .connect(mongo)
  .then(() => {
    const port = Number(process.env.PORT) || 4000;
    app.listen(port, () => console.log(`API listening on ${port}`));
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
    process.exit(1);
  });


