const { body, param } = require("express-validator");

const addItemValidator = [
  body("petId")
    .notEmpty()
    .withMessage("petId is required")
    .isMongoId()
    .withMessage("petId must be a valid id"),
];

const removeItemValidator = [param("petId").isMongoId().withMessage("petId must be a valid id")];

module.exports = { addItemValidator, removeItemValidator };
