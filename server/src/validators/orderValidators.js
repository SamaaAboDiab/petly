const { body, param } = require("express-validator");
const { ORDER_STATUSES } = require("../config/constants");

const MAX_ITEMS = 20;

const createOrderValidator = [
  body("items")
    .isArray({ min: 1, max: MAX_ITEMS })
    .withMessage(`Items must be a list of 1 to ${MAX_ITEMS} pets`),
  body("items.*.petId").isMongoId().withMessage("Each item needs a valid petId"),
  body("promoCode").optional({ values: "null" }).isString().isLength({ max: 20 }),
];

const promoValidator = [
  body("code").trim().notEmpty().withMessage("Promo code is required").isLength({ max: 20 }),
];

const updateStatusValidator = [
  param("id").isMongoId().withMessage("Invalid order id"),
  body("status")
    .isIn(ORDER_STATUSES.filter((s) => s !== "pending"))
    .withMessage("Status must be confirmed, delivered or cancelled"),
];

module.exports = { createOrderValidator, promoValidator, updateStatusValidator };
