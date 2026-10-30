const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../config/constants");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, default: "", maxlength: 300 },
    // In-app path to open when clicked, e.g. /app/pets/golden-retriever
    link: { type: String, default: null },
    // Who/what caused it — used to avoid duplicates (e.g. favorite toggled on/off/on).
    dedupeKey: { type: String, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

notificationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    delete ret.dedupeKey;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
