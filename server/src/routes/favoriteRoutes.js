const express = require("express");
const {
  getFavorites,
  togglePet,
  toggleSeller,
  clearFavorites,
} = require("../controllers/favoriteController");
const {
  toggleFavoriteValidator,
  clearFavoritesValidator,
} = require("../validators/favoriteValidators");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getFavorites);
router.post("/pets/:id", toggleFavoriteValidator, validate, togglePet);
router.post("/sellers/:id", toggleFavoriteValidator, validate, toggleSeller);
router.delete("/:type", clearFavoritesValidator, validate, clearFavorites);

module.exports = router;
