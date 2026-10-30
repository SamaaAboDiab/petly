const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned by default on find queries
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    location: {
      type: String,
      trim: true,
      default: "Cairo, Egypt",
    },
    avatar: {
      type: String,
      default: null,
    },
    // Set by an admin once the seller's identity is checked.
    verified: {
      type: Boolean,
      default: false,
    },
    // Every user is both a buyer and a seller, so favorites live on the user
    // and can point at pets or at other users (sellers).
    favorites: {
      pets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
      sellers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    // Forgot-password flow: only the SHA-256 hash of the emailed token is
    // stored, so a database leak can't be used to reset accounts.
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    // Which notification groups the user wants (see NOTIFICATION_PREFERENCE).
    preferences: {
      notifications: {
        orders: { type: Boolean, default: true },
        activity: { type: Boolean, default: true },
        account: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Hash the password before saving, but only when it was actually set/changed
// (avoids re-hashing an already-hashed password on unrelated updates).
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Belt-and-suspenders: strip password/__v even if a query ever explicitly
// selects the password field back in.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
