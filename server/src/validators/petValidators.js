const { body, param, query } = require("express-validator");
const { CATEGORIES, GENDERS, HEALTH_FEATURES } = require("../config/constants");
const { isBlobUrl } = require("../utils/files");

// Health flags arrive as "true"/"false" strings in multipart forms.
const featureRules = HEALTH_FEATURES.map((key) =>
  body(key).optional().isBoolean().withMessage(`${key} must be true or false`).toBoolean()
);

const imageUrlRule = body("imageUrl")
  .optional({ values: "falsy" })
  .trim()
  .isURL({ protocols: ["http", "https"], require_protocol: true })
  .withMessage("Image URL must be a valid http(s) link")
  // Our own Blob URLs are deleted with the listing, so pointing a listing at
  // someone else's upload could delete their photo.
  .custom((url) => !isBlobUrl(url))
  .withMessage("Upload the photo instead of linking to an uploaded one");

const listPetsValidator = [
  query("category").optional().isIn(["all", ...CATEGORIES]).withMessage("Unknown category"),
  query("search").optional().isString().isLength({ max: 80 }),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
];

const createPetValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }),
  body("category").isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("age").trim().notEmpty().withMessage("Age is required").isLength({ max: 30 }),
  body("gender").isIn(GENDERS).withMessage("Gender must be Male or Female"),
  body("location").trim().notEmpty().withMessage("Location is required").isLength({ max: 80 }),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0")
    .toFloat(),
  body("description")
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  imageUrlRule,
  ...featureRules,
];

const updatePetValidator = [
  param("id").isMongoId().withMessage("Invalid pet id"),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty").isLength({ max: 60 }),
  body("category").optional().isIn(CATEGORIES).withMessage("Unknown category"),
  body("age").optional().trim().notEmpty().withMessage("Age cannot be empty"),
  body("gender").optional().isIn(GENDERS).withMessage("Gender must be Male or Female"),
  body("location").optional().trim().notEmpty().withMessage("Location cannot be empty"),
  body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be greater than 0").toFloat(),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  imageUrlRule,
  ...featureRules,
];

const petIdValidator = [param("id").isMongoId().withMessage("Invalid pet id")];

module.exports = { listPetsValidator, createPetValidator, updatePetValidator, petIdValidator };
