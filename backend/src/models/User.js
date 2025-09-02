import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["Admin", "Seller", "Services", "Customer"], required: true, default: "Customer" },
    name: { type: String },
    avatar: { type: String },
    googleId: { type: String },
    lastLogin: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);


