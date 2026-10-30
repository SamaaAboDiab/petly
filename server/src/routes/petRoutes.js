const express = require("express");
const {
  getPets,
  getCategoryCounts,
  getMyPets,
  getPet,
  createPet,
  updatePet,
  deletePet,
} = require("../controllers/petController");
const {
  listPetsValidator,
  createPetValidator,
  updatePetValidator,
  petIdValidator,
} = require("../validators/petValidators");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { uploadPetImages } = require("../middleware/upload");

const router = express.Router();

// NOTE: /categories and /mine must be registered before /:idOrSlug, otherwise
// Express would match them as the param.
router.get("/categories", getCategoryCounts);
router.get("/mine", protect, getMyPets);

router.get("/", listPetsValidator, validate, getPets);
router.get("/:idOrSlug", getPet);

// Ownership (owner or admin) is checked inside the controller, since it
// depends on the pet document.
router.post("/", protect, uploadPetImages, createPetValidator, validate, createPet);
router.put("/:id", protect, uploadPetImages, updatePetValidator, validate, updatePet);
router.delete("/:id", protect, petIdValidator, validate, deletePet);

module.exports = router;
