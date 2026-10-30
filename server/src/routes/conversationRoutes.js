const express = require("express");
const {
  getConversations,
  getUnreadCount,
  startConversation,
  getMessages,
  sendMessage,
  markRead,
} = require("../controllers/conversationController");
const {
  startConversationValidator,
  conversationIdValidator,
  getMessagesValidator,
  sendMessageValidator,
} = require("../validators/conversationValidators");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// NOTE: /unread-count must be registered before /:id routes.
router.get("/unread-count", getUnreadCount);

router.get("/", getConversations);
router.post("/", startConversationValidator, validate, startConversation);
router.get("/:id/messages", getMessagesValidator, validate, getMessages);
router.post("/:id/messages", sendMessageValidator, validate, sendMessage);
router.post("/:id/read", conversationIdValidator, validate, markRead);

module.exports = router;
