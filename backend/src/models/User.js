// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema(
//   {
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     passwordHash: { type: String },
//     role: { type: String, enum: ["Admin", "Seller", "Services", "Customer"], required: true, default: "Customer" },
//     name: { type: String },
//     avatar: { type: String },
//     googleId: { type: String },
//     lastLogin: { type: Date, default: Date.now },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", UserSchema); 


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String },
  googleId: { type: String, unique: true },
  role: { type: String, enum: ["Customer", "Seller", "Services", "Admin"], default: "Customer" },
  passwordHash: { type: String },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
});

// Ensure no unique index on name
userSchema.index({ name: 1 }, { unique: false });

const User = mongoose.model("User", userSchema);
export default User;