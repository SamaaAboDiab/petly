const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { emitToUser } = require("../socket");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Pet = require("../models/Pet");
const User = require("../models/User");

const DEFAULT_PAGE = 30;

// One populate() call with an array works on both queries and documents
// (document.populate returns a promise, so it can't be chained).
const POPULATE = [
  { path: "participants", select: "name avatar verified" },
  { path: "pet", select: "name slug images price" },
];
const populateConversation = (queryOrDoc) => queryOrDoc.populate(POPULATE);

// The list/thread header shape, seen from `viewerId`'s side.
const serializeConversation = (conversation, viewerId) => {
  const other = conversation.participants.find((p) => String(p._id) !== String(viewerId));
  const pet = conversation.pet;
  return {
    id: conversation._id,
    other: other && { id: other._id, name: other.name, avatar: other.avatar, verified: other.verified },
    pet: pet && { id: pet._id, name: pet.name, slug: pet.slug, image: pet.images?.[0], price: pet.price },
    lastMessage: conversation.lastMessage?.text ? conversation.lastMessage : null,
    unread: conversation.unread?.get(String(viewerId)) ?? 0,
    updatedAt: conversation.updatedAt,
  };
};

// Loads a conversation the current user belongs to. Returns 404 (not 403)
// for other people's conversations so ids can't be probed.
const loadOwnConversation = async (req) => {
  const conversation = await populateConversation(
    Conversation.findOne({ _id: req.params.id, participants: req.user._id })
  );
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }
  return conversation;
};

// @route   GET /api/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  // A conversation the other person opened but hasn't written in yet is
  // hidden from me; the initiator (participants[0]) always sees it.
  const conversations = await populateConversation(
    Conversation.find({
      participants: req.user._id,
      $or: [{ "lastMessage.text": { $exists: true } }, { "participants.0": req.user._id }],
    })
      .sort({ updatedAt: -1 })
      .limit(100)
  );

  res.status(200).json({
    success: true,
    data: { conversations: conversations.map((c) => serializeConversation(c, req.user._id)) },
  });
});

// @route   GET /api/conversations/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id }).select("unread").lean();
  const me = String(req.user._id);
  const unread = conversations.reduce((sum, c) => sum + (c.unread?.[me] ?? 0), 0);

  res.status(200).json({
    success: true,
    data: { unread },
  });
});

// @route   POST /api/conversations
// @access  Private
// Body: { sellerId, petId? }. Returns the existing conversation with that
// user, or starts a new one.
const startConversation = asyncHandler(async (req, res) => {
  const { sellerId, petId } = req.body;

  if (req.user._id.equals(sellerId)) {
    throw new AppError("You cannot message yourself", 400);
  }
  if (!(await User.exists({ _id: sellerId }))) {
    throw new AppError("Seller not found", 404);
  }
  if (petId && !(await Pet.exists({ _id: petId }))) {
    throw new AppError("Pet not found", 404);
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, sellerId], $size: 2 },
  });

  if (!conversation) {
    conversation = new Conversation({ participants: [req.user._id, sellerId] });
  }
  if (petId) conversation.pet = petId;
  await conversation.save();
  await populateConversation(conversation);

  res.status(200).json({
    success: true,
    data: { conversation: serializeConversation(conversation, req.user._id) },
  });
});

// @route   GET /api/conversations/:id/messages?before=<ISO date>&limit=30
// @access  Private (participants only)
// Returns one page, oldest first, plus whether older messages exist.
const getMessages = asyncHandler(async (req, res) => {
  const conversation = await loadOwnConversation(req);
  const limit = Math.min(Number(req.query.limit) || DEFAULT_PAGE, 50);

  const filter = { conversation: conversation._id };
  if (req.query.before) filter.createdAt = { $lt: new Date(req.query.before) };

  const page = await Message.find(filter).sort({ createdAt: -1 }).limit(limit + 1);
  const hasMore = page.length > limit;

  res.status(200).json({
    success: true,
    data: {
      conversation: serializeConversation(conversation, req.user._id),
      messages: page.slice(0, limit).reverse(),
      hasMore,
    },
  });
});

// @route   POST /api/conversations/:id/messages
// @access  Private (participants only)
const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await loadOwnConversation(req);
  const me = req.user._id;
  const otherId = conversation.otherParticipantId(me);

  const message = await Message.create({ conversation: conversation._id, sender: me, text: req.body.text });

  conversation.lastMessage = { text: message.text, sender: me, createdAt: message.createdAt };
  conversation.unread.set(String(otherId), (conversation.unread.get(String(otherId)) ?? 0) + 1);
  await conversation.save();

  // Push to both sides: the recipient, and the sender's other open tabs.
  [me, otherId].forEach((userId) =>
    emitToUser(userId, "message:new", {
      message,
      conversation: serializeConversation(conversation, userId),
    })
  );

  res.status(201).json({
    success: true,
    data: { message },
  });
});

// @route   POST /api/conversations/:id/read
// @access  Private (participants only)
const markRead = asyncHandler(async (req, res) => {
  const conversation = await loadOwnConversation(req);
  const me = String(req.user._id);

  if (conversation.unread.get(me)) {
    conversation.unread.set(me, 0);
    // Reading must not bump the conversation to the top of the list.
    await conversation.save({ timestamps: false });
  }

  emitToUser(req.user._id, "conversation:read", { conversationId: conversation._id });

  res.status(200).json({
    success: true,
    data: { conversationId: conversation._id },
  });
});

module.exports = {
  getConversations,
  getUnreadCount,
  startConversation,
  getMessages,
  sendMessage,
  markRead,
};
