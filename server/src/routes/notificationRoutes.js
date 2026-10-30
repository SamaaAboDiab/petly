const express = require("express");
const { param, query } = require("express-validator");
const { getNotifications, markRead, markAllRead } = require("../controllers/notificationController");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", [query("before").optional().isISO8601()], validate, getNotifications);
// NOTE: /read-all must be registered before /:id routes.
router.post("/read-all", markAllRead);
router.post("/:id/read", [param("id").isMongoId().withMessage("Invalid notification id")], validate, markRead);

module.exports = router;
