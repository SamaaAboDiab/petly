const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { toSellerProfiles } = require("../utils/serializers");
const { AVAILABLE_FILTER } = require("../config/constants");
const Pet = require("../models/Pet");
const User = require("../models/User");

// @route   GET /api/sellers/:id
// @access  Public
// Public seller page: profile, pets still for sale, and how many found homes.
const getSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("Seller not found", 404);
  }

  const [[seller], pets, soldCount] = await Promise.all([
    toSellerProfiles([user]),
    Pet.find({ seller: user._id, ...AVAILABLE_FILTER }).sort({ createdAt: -1 }),
    Pet.countDocuments({ seller: user._id, status: "sold" }),
  ]);

  res.status(200).json({
    success: true,
    data: { seller: { ...seller, soldCount }, pets },
  });
});

module.exports = { getSeller };
