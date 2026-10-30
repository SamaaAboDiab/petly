const { param } = require("express-validator");

const toggleFavoriteValidator = [param("id").isMongoId().withMessage("Invalid id")];

const clearFavoritesValidator = [
  param("type").isIn(["pets", "sellers"]).withMessage("Type must be pets or sellers"),
];

module.exports = { toggleFavoriteValidator, clearFavoritesValidator };
