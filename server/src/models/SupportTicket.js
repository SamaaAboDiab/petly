const mongoose = require("mongoose");
const { SUPPORT_CATEGORIES } = require("../config/constants");

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: SUPPORT_CATEGORIES,
      required: true,
    },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    // Filled by an admin from the dashboard.
    reply: { type: String, default: null, maxlength: 2000 },
  },
  { timestamps: true }
);

supportTicketSchema.index({ status: 1, createdAt: -1 });

supportTicketSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
