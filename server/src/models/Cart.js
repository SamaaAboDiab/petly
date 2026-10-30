const mongoose = require("mongoose");

// Every pet is a single animal, so a cart line is just a pet reference.
const cartItemSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
  },
  { _id: false, timestamps: { createdAt: "addedAt", updatedAt: false } }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

cartSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Cart", cartSchema);
