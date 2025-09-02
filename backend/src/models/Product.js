import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    sku: { type: String },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", category: "text", tags: "text" });

export default mongoose.model("Product", ProductSchema);


