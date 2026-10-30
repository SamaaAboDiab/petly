const express = require("express");
const { param, query } = require("express-validator");
const {
  getUsers,
  getUserById,
  updateUserRole,
  setVerified,
  deleteUser,
} = require("../controllers/userController");
const { updateUserRoleValidator, setVerifiedValidator } = require("../validators/userValidators");
const validate = require("../middleware/validate");
const { protect, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(protect, isAdmin);

router.get(
  "/",
  [query("search").optional().isString().isLength({ max: 80 }), query("page").optional().isInt({ min: 1 })],
  validate,
  getUsers
);
router.get("/:id", param("id").isMongoId(), validate, getUserById);
router.patch("/:id/role", updateUserRoleValidator, validate, updateUserRole);
router.patch("/:id/verify", setVerifiedValidator, validate, setVerified);
router.delete("/:id", param("id").isMongoId(), validate, deleteUser);

module.exports = router;
