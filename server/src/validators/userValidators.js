const { body } = require("express-validator");

const updateUserRoleValidator = [
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
];

const setVerifiedValidator = [
  body("verified").isBoolean().withMessage("verified must be true or false").toBoolean(),
];

module.exports = { updateUserRoleValidator, setVerifiedValidator };
