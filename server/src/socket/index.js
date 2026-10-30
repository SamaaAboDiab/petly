const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const User = require("../models/User");
const Conversation = require("../models/Conversation");

let io = null;

const userRoom = (userId) => `user:${userId}`;

// Same token as the REST API (sent in the handshake as `auth.token`).
const authenticate = async (socket, next) => {
  try {
    const { userId } = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
    const user = await User.findById(userId).select("_id name");
    if (!user) return next(new Error("Unauthorized"));
    socket.data.user = user;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};

const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, { cors: { origin: allowedOrigins } });

  io.use(authenticate);

  io.on("connection", (socket) => {
    const me = socket.data.user._id;

    // Each user listens on a private room; every push targets a user, so a
    // client can never subscribe to someone else's conversation.
    socket.join(userRoom(me));

    // Payload: { conversationId }. Relayed only if the sender is a participant.
    socket.on("typing", async (payload) => {
      const conversationId = payload?.conversationId;
      if (!mongoose.isValidObjectId(conversationId)) return;

      const conversation = await Conversation.findOne({ _id: conversationId, participants: me })
        .select("participants")
        .lean();
      if (!conversation) return;

      conversation.participants
        .filter((id) => !id.equals(me))
        .forEach((id) => io.to(userRoom(id)).emit("typing", { conversationId, userId: me }));
    });
  });

  return io;
};

/** Push an event to every open tab of a user. No-op before the socket is up (e.g. seed, tests). */
const emitToUser = (userId, event, payload) => {
  io?.to(userRoom(userId)).emit(event, payload);
};

module.exports = { initSocket, emitToUser };
