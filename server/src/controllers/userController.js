const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { escapeRegex, paginate } = require("../utils/query");
const Cart = require("../models/Cart");
const Notification = require("../models/Notification");
const Pet = require("../models/Pet");
const User = require("../models/User");
const { notify } = require("../services/notificationService");
const { removeUploads } = require("../utils/files");

const toAdminUser = (user, listings = 0) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  verified: user.verified,
  avatar: user.avatar,
  location: user.location,
  createdAt: user.createdAt,
  listings,
});

// @route   GET /api/users?search=&page=&limit=
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const pattern = new RegExp(escapeRegex(req.query.search.trim()), "i");
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const { page, limit, skip } = paginate(req.query);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  // One aggregate for all listing counts on this page (no N+1).
  const counts = await Pet.aggregate([
    { $match: { seller: { $in: users.map((u) => u._id) } } },
    { $group: { _id: "$seller", count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((c) => [String(c._id), c.count]));

  res.status(200).json({
    success: true,
    data: {
      users: users.map((u) => toAdminUser(u, countById.get(String(u._id)) ?? 0)),
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      total,
    },
  });
});

// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @route   PATCH /api/users/:id/role
// @access  Private/Admin
// An admin can't change their own role - prevents an admin from locking
// themselves out (or the last admin demoting themselves) by mistake.
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (req.params.id === String(req.user._id)) {
    throw new AppError("You cannot change your own role", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    throw new AppError("You cannot delete your own account", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Remove what only makes sense with the account, and references to it.
  // Orders and conversations are kept as history for the other party.
  const pets = await Pet.find({ seller: user._id }).select("_id images").lean();
  const petIds = pets.map((p) => p._id);
  await Promise.all([
    Pet.deleteMany({ seller: user._id }),
    Cart.deleteOne({ user: user._id }),
    Notification.deleteMany({ user: user._id }),
    User.updateMany({}, { $pull: { "favorites.pets": { $in: petIds }, "favorites.sellers": user._id } }),
    Cart.updateMany({}, { $pull: { items: { pet: { $in: petIds } } } }),
  ]);
  await user.deleteOne();
  removeUploads([user.avatar, ...pets.flatMap((p) => p.images)]);

  res.status(200).json({
    success: true,
    data: { message: "User deleted successfully" },
  });
});

// @route   PATCH /api/users/:id/verify
// @access  Private/Admin
// Marks a seller as identity-checked (shows the Verified badge on listings).
const setVerified = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.verified = req.body.verified;
  await user.save();

  if (user.verified) {
    notify(user._id, {
      type: "verified",
      title: "You're now a verified seller",
      body: "A verified badge now appears on your listings and profile.",
      link: "/app/profile",
    });
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = { getUsers, getUserById, updateUserRole, setVerified, deleteUser };
