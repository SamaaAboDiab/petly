const express = require("express");
const {
  validatePromo,
  createOrder,
  getMyOrders,
  getMySales,
  updateStatus,
} = require("../controllers/orderController");
const { createOrderValidator, promoValidator, updateStatusValidator } = require("../validators/orderValidators");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/mine", getMyOrders);
router.get("/sales", getMySales);
router.post("/promo", promoValidator, validate, validatePromo);
router.post("/", createOrderValidator, validate, createOrder);
router.patch("/:id/status", updateStatusValidator, validate, updateStatus);

module.exports = router;
