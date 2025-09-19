// import mongoose from "mongoose";

// const ProductSchema = new mongoose.Schema(
//   {
//     sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     category: { type: String, required: true },
//     price: { type: Number, required: true },
//     sku: { type: String },
//     stock: { type: Number, default: 0 },
//     images: [{ type: String }],
//     tags: [{ type: String }],
//   },
//   { timestamps: true }
// );

// ProductSchema.index({ name: "text", description: "text", category: "text", tags: "text" });

// export default mongoose.model("Product", ProductSchema);

// backend/src/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    category: {
      type: String,
      trim: true,
      enum: {
        values: ["Painting", "Sculpture", "Craft", "Other"], // Example categories
        message: "{VALUE} is not a valid category",
      },
    },
    image: {
      type: String,
      trim: true,
      match: [/^(http|https):\/\/[^\s/$.?#].[^\s]*$/, "Please provide a valid URL for the image"],
    },
    sales: {
      type: Number,
      default: 0,
      min: [0, "Sales cannot be negative"],
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["paid", "shipped", "pending"], default: "pending" },
  amount: Number,

    revenue: {
      type: Number,
      default: 0,
      min: [0, "Revenue cannot be negative"],
    },
  },
  { timestamps: true }
);

// Index for faster queries by seller and name
productSchema.index({ seller: 1, name: 1 });

export default mongoose.model("Product", productSchema);

