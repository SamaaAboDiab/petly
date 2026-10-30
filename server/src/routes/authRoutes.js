const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidators");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidator, validate, resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
