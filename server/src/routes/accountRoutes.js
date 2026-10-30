const express = require("express");
const { body } = require("express-validator");
const { updateProfile, changePassword, updatePreferences } = require("../controllers/accountController");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const { uploadAvatar } = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.patch(
  "/profile",
  uploadAvatar,
  [
    body("name").optional().trim().isLength({ min: 3, max: 60 }).withMessage("Name must be between 3 and 60 characters"),
    body("location").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Location must be between 2 and 80 characters"),
    body("removeAvatar").optional().isBoolean().toBoolean(),
  ],
  validate,
  updateProfile
);

// Rate-limited like login: a stolen session shouldn't be able to brute-force
// the current password.
router.patch(
  "/password",
  authLimiter,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters")
      .custom((value, { req }) => value !== req.body.currentPassword)
      .withMessage("New password must be different from the current one"),
  ],
  validate,
  changePassword
);

router.patch(
  "/preferences",
  [body("notifications").isObject().withMessage("notifications must be an object"), body("notifications.*").isBoolean()],
  validate,
  updatePreferences
);

module.exports = router;
