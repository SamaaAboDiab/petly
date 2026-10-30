const express = require("express");
const { body, param, query } = require("express-validator");
const { getStats, getPets, getOrders, getTickets, updateTicket } = require("../controllers/adminController");
const validate = require("../middleware/validate");
const { protect, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(protect, isAdmin);

const listQuery = [
  query("search").optional().isString().isLength({ max: 80 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

router.get("/stats", getStats);
router.get("/pets", listQuery, validate, getPets);
router.get("/orders", listQuery, validate, getOrders);
router.get("/tickets", [...listQuery, query("status").optional().isIn(["open", "resolved"])], validate, getTickets);
router.patch(
  "/tickets/:id",
  [
    param("id").isMongoId().withMessage("Invalid ticket id"),
    body("reply").optional({ values: "null" }).isString().trim().isLength({ max: 2000 }),
    body("status").optional().isIn(["open", "resolved"]),
  ],
  validate,
  updateTicket
);

module.exports = router;
