const { body, param, query } = require("express-validator");

const startConversationValidator = [
  body("sellerId").isMongoId().withMessage("sellerId must be a valid id"),
  body("petId").optional({ values: "null" }).isMongoId().withMessage("petId must be a valid id"),
];

const conversationIdValidator = [param("id").isMongoId().withMessage("Invalid conversation id")];

const getMessagesValidator = [
  ...conversationIdValidator,
  query("before").optional().isISO8601().withMessage("before must be a date"),
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

const sendMessageValidator = [
  ...conversationIdValidator,
  body("text")
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
];

module.exports = {
  startConversationValidator,
  conversationIdValidator,
  getMessagesValidator,
  sendMessageValidator,
};
