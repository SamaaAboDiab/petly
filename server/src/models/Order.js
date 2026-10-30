const crypto = require("crypto");
const mongoose = require("mongoose");
const { ORDER_STATUSES } = require("../config/constants");

// Each item is a snapshot of the pet at checkout time, so the order history
// stays correct even if the listing is later edited or deleted. Every pet is
// a single animal, so there is no quantity.
const orderItemSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const statusEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

// One order per seller: a checkout with pets from two sellers creates two
// orders, because each seller confirms and delivers independently.
const orderSchema = new mongoose.Schema(
  {
    // Short human-friendly reference shown to the customer (e.g. PT-4F9A2C).
    orderNumber: {
      type: String,
      unique: true,
      default: () => `PT-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(list) => list.length > 0, "An order needs at least one item"],
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    promoCode: { type: String, default: null },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    statusHistory: {
      type: [statusEntrySchema],
      default: () => [{ status: "pending" }],
    },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);
