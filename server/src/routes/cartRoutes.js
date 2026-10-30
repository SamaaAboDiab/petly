const express = require("express");
const { getCart, addItem, removeItem, clearCart } = require("../controllers/cartController");
const { addItemValidator, removeItemValidator } = require("../validators/cartValidators");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

// The cart always belongs to the logged-in user, so every route here needs
// a valid session.
router.use(protect);

router.get("/", getCart);
router.post("/items", addItemValidator, validate, addItem);
router.delete("/items/:petId", removeItemValidator, validate, removeItem);
router.delete("/", clearCart);

module.exports = router;
