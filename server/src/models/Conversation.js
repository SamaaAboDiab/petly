const mongoose = require("mongoose");

// One conversation per pair of users. `pet` remembers which listing the chat
// is about (updated when the buyer reaches out from another listing).
const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [(list) => list.length === 2, "A conversation has exactly two participants"],
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      default: null,
    },
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: Date,
    },
    // userId -> number of messages that user hasn't read yet.
    unread: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

conversationSchema.methods.isParticipant = function (userId) {
  return this.participants.some((p) => String(p._id ?? p) === String(userId));
};

conversationSchema.methods.otherParticipantId = function (userId) {
  const other = this.participants.find((p) => String(p._id ?? p) !== String(userId));
  return other?._id ?? other;
};

module.exports = mongoose.model("Conversation", conversationSchema);
