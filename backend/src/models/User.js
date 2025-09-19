import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, // Normalize emails
    trim: true, // Remove whitespace
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"] // Email validation
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100 // Prevent overly long names
  },
  avatar: { 
    type: String,
    default: "https://via.placeholder.com/150" // Default avatar
  },
  googleId: { 
    type: String, 
    unique: true,
    sparse: true // Allows multiple null values for non-Google users
  },
  role: { 
    type: String, 
    enum: ["Customer", "Seller", "Services", "Admin"], 
    default: "Customer",
    required: true
  },
  passwordHash: { 
    type: String,
    select: false // Exclude from queries by default for security
  },
  lastLogin: { 
    type: Date,
    default: Date.now // Default to creation time
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true // Auto-add createdAt and updatedAt
});

// Ensure no unique index on name (explicitly non-unique)
userSchema.index({ name: 1 }, { unique: false });

// Pre-save hook for password hashing (if modified)
userSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash") && this.passwordHash) {
    const bcrypt = await import("bcrypt");
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  const bcrypt = await import("bcrypt");
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

const User = mongoose.model("User", userSchema);
export default User;

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   avatar: { type: String },
//   googleId: { type: String, unique: true },
//   role: { type: String, enum: ["Customer", "Seller", "Services", "Admin"], default: "Customer" },
//   passwordHash: { type: String },
//   lastLogin: { type: Date },
//   isActive: { type: Boolean, default: true },
// });

// // Ensure no unique index on name
// userSchema.index({ name: 1 }, { unique: false });

// const User = mongoose.model("User", userSchema);
// export default User;