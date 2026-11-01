const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { toSellerProfiles } = require("../utils/serializers");
const { escapeRegex } = require("../utils/query");
const { AVAILABLE_FILTER, DEFAULT_PET_IMAGES, HEALTH_FEATURES } = require("../config/constants");
const Pet = require("../models/Pet");
const User = require("../models/User");
const { removeUploads } = require("../utils/files");

// Keys match the frontend's sort dropdown values.
const SORT_OPTIONS = {
  featured: { popular: -1, rating: -1, createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { rating: -1 },
  newest: { createdAt: -1 },
};

const MAX_LIMIT = 100;
const RELATED_COUNT = 4;

// Accepts either a Mongo id or a slug, so both /pets/665f... and
// /pets/golden-retriever work.
const findPetByIdOrSlug = (idOrSlug) =>
  mongoose.isValidObjectId(idOrSlug) ? Pet.findById(idOrSlug) : Pet.findOne({ slug: idOrSlug });

const loadOwnedPet = async (req) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    throw new AppError("Pet not found", 404);
  }
  const isOwner = pet.seller.equals(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    throw new AppError("You can only modify your own listings", 403);
  }
  return pet;
};

// Builds the editable fields from the request: health flags, images (uploaded
// files win over a pasted URL) - shared by create and update.
const pickPetFields = (body, { isCreate }) => {
  const fields = {};
  ["name", "category", "age", "gender", "location", "price", "description"].forEach((key) => {
    if (body[key] !== undefined) fields[key] = body[key];
  });

  HEALTH_FEATURES.forEach((key) => {
    if (body[key] !== undefined) fields[`features.${key}`] = body[key];
  });

  if (body.uploadedImages?.length) {
    fields.images = body.uploadedImages;
  } else if (body.imageUrl) {
    fields.images = [body.imageUrl];
  } else if (isCreate) {
    fields.images = [DEFAULT_PET_IMAGES[body.category]];
  }

  return fields;
};

// @route   GET /api/pets
// @access  Public
const getPets = asyncHandler(async (req, res) => {
  const { search, category, sort, minPrice, maxPrice } = req.query;

  // The shop only shows pets that can still be bought.
  const filter = { ...AVAILABLE_FILTER };

  if (search) {
    // Partial words ("husk") match, so this is an escaped regex rather than $text.
    const pattern = new RegExp(escapeRegex(search.trim()), "i");
    // Also match pets whose seller's name matches ("mariam").
    const sellers = await User.find({ name: pattern }).select("_id").limit(50).lean();
    filter.$or = [
      { name: pattern },
      { location: pattern },
      { category: pattern },
      { seller: { $in: sellers.map((s) => s._id) } },
    ];
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const [pets, totalPets] = await Promise.all([
    Pet.find(filter).sort(SORT_OPTIONS[sort] || SORT_OPTIONS.featured).skip(skip).limit(limit),
    Pet.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      pets,
      page,
      totalPages: Math.max(Math.ceil(totalPets / limit), 1),
      totalPets,
    },
  });
});

// @route   GET /api/pets/categories
// @access  Public
const getCategoryCounts = asyncHandler(async (req, res) => {
  const counts = await Pet.aggregate([
    { $match: AVAILABLE_FILTER },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: { categories: counts.map((c) => ({ id: c._id, count: c.count })) },
  });
});

// @route   GET /api/pets/mine
// @access  Private
const getMyPets = asyncHandler(async (req, res) => {
  const pets = await Pet.find({ seller: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { pets },
  });
});

// @route   GET /api/pets/:idOrSlug
// @access  Public
// Returns everything the details page needs in one round trip.
const getPet = asyncHandler(async (req, res) => {
  const pet = await findPetByIdOrSlug(req.params.idOrSlug);

  if (!pet) {
    throw new AppError("Pet not found", 404);
  }

  const [sellerUser, related] = await Promise.all([
    User.findById(pet.seller),
    Pet.find({ category: pet.category, _id: { $ne: pet._id }, ...AVAILABLE_FILTER })
      .sort(SORT_OPTIONS.featured)
      .limit(RELATED_COUNT),
  ]);

  const [seller] = sellerUser ? await toSellerProfiles([sellerUser]) : [null];

  res.status(200).json({
    success: true,
    data: { pet, seller, related },
  });
});

// @route   POST /api/pets
// @access  Private (any signed-in user can list a pet)
const createPet = asyncHandler(async (req, res) => {
  const pet = new Pet({ seller: req.user._id });
  pet.set(pickPetFields(req.body, { isCreate: true }));
  await pet.save();

  res.status(201).json({
    success: true,
    data: { pet },
  });
});

// @route   PUT /api/pets/:id
// @access  Private (owner or admin)
const updatePet = asyncHandler(async (req, res) => {
  const pet = await loadOwnedPet(req);
  if (pet.status === "sold") {
    throw new AppError("Sold listings can't be edited", 400);
  }
  const previousImages = [...pet.images];
  pet.set(pickPetFields(req.body, { isCreate: false }));
  await pet.save();
  // Photos that were replaced are no longer referenced anywhere.
  removeUploads(previousImages.filter((url) => !pet.images.includes(url)));

  res.status(200).json({
    success: true,
    data: { pet },
  });
});

// @route   DELETE /api/pets/:id
// @access  Private (owner or admin)
const deletePet = asyncHandler(async (req, res) => {
  const pet = await loadOwnedPet(req);
  await pet.deleteOne();
  removeUploads(pet.images);

  // Don't leave dangling references in other users' favorites.
  await User.updateMany({ "favorites.pets": pet._id }, { $pull: { "favorites.pets": pet._id } });

  res.status(200).json({
    success: true,
    data: { message: "Listing deleted successfully" },
  });
});

module.exports = {
  getPets,
  getCategoryCounts,
  getMyPets,
  getPet,
  createPet,
  updatePet,
  deletePet,
};
