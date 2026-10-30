const express = require("express");
const { body } = require("express-validator");
const { createTicket, getMyTickets } = require("../controllers/supportController");
const { SUPPORT_CATEGORIES } = require("../config/constants");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/mine", getMyTickets);
router.post(
  "/",
  [
    body("category").isIn(SUPPORT_CATEGORIES).withMessage("Please choose a topic"),
    body("subject").trim().isLength({ min: 3, max: 120 }).withMessage("Subject must be between 3 and 120 characters"),
    body("message").trim().isLength({ min: 10, max: 2000 }).withMessage("Message must be between 10 and 2000 characters"),
  ],
  validate,
  createTicket
);

module.exports = router;
