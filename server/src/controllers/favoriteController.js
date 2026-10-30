const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { toSellerProfiles } = require("../utils/serializers");
const Pet = require("../models/Pet");
const User = require("../models/User");
const { notify } = require("../services/notificationService");

// Favorites are stored as id lists on the user; this expands them into the
// pet cards / seller cards the Favorites page renders.
const loadFavorites = async (userId) => {
  const user = await User.findById(userId)
    .populate("favorites.pets")
    .populate("favorites.sellers");

  // Populate yields null for deleted documents - skip them.
  const pets = user.favorites.pets.filter(Boolean);
  const sellers = await toSellerProfiles(user.favorites.sellers.filter(Boolean));

  return { pets, sellers };
};

const sendFavorites = async (res, userId) =>
  res.status(200).json({
    success: true,
    data: await loadFavorites(userId),
  });

// Adds the id if missing, removes it if present - one endpoint per heart button.
const toggleId = async (userId, field, id) => {
  const user = await User.findById(userId);
  const list = user.favorites[field];
  const exists = list.some((item) => item.equals(id));

  await User.updateOne(
    { _id: userId },
    exists ? { $pull: { [`favorites.${field}`]: id } } : { $addToSet: { [`favorites.${field}`]: id } }
  );

  return !exists;
};

// @route   GET /api/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  await sendFavorites(res, req.user._id);
});

// @route   POST /api/favorites/pets/:id
// @access  Private
const togglePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id).select("name slug seller");
  if (!pet) {
    throw new AppError("Pet not found", 404);
  }

  const favorited = await toggleId(req.user._id, "pets", req.params.id);

  if (favorited && !pet.seller.equals(req.user._id)) {
    notify(pet.seller, {
      type: "favorite",
      title: `${req.user.name} saved your ${pet.name}`,
      body: "Someone is interested — they might message you soon.",
      link: `/app/pets/${pet.slug}`,
      dedupeKey: `favorite:${req.user._id}:${pet._id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: { favorited },
  });
});

// @route   POST /api/favorites/sellers/:id
// @access  Private
const toggleSeller = asyncHandler(async (req, res) => {
  if (req.user._id.equals(req.params.id)) {
    throw new AppError("You cannot favorite yourself", 400);
  }
  if (!(await User.exists({ _id: req.params.id }))) {
    throw new AppError("Seller not found", 404);
  }

  const favorited = await toggleId(req.user._id, "sellers", req.params.id);

  if (favorited) {
    notify(req.params.id, {
      type: "follow",
      title: `${req.user.name} started following you`,
      body: "They'll see your new listings in their favorites.",
      link: "/app/profile",
      dedupeKey: `follow:${req.user._id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: { favorited },
  });
});

// @route   DELETE /api/favorites/:type   (type = pets | sellers)
// @access  Private
const clearFavorites = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $set: { [`favorites.${req.params.type}`]: [] } });
  await sendFavorites(res, req.user._id);
});

module.exports = { getFavorites, togglePet, toggleSeller, clearFavorites };
