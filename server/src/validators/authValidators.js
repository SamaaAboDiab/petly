const { body } = require("express-validator");
const User = require("../models/User");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 60 })
    .withMessage("Name must be between 3 and 60 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email is already registered");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("location").optional().trim().isLength({ max: 80 }),
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidator = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
];

const resetPasswordValidator = [
  body("token")
    .isString()
    .matches(/^[a-f0-9]{64}$/)
    .withMessage("This reset link is invalid or has expired. Please request a new one."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

module.exports = { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator };
