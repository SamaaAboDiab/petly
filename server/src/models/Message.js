const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Message cannot be empty"],
      trim: true,
      maxlength: [1000, "Message is too long"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Thread pages are read newest-first per conversation.
messageSchema.index({ conversation: 1, createdAt: -1 });

messageSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Message", messageSchema);
