const express = require("express");
const { param } = require("express-validator");
const { getSeller } = require("../controllers/sellerController");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/:id", param("id").isMongoId().withMessage("Invalid seller id"), validate, getSeller);

module.exports = router;
