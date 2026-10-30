const fs = require("fs");
const path = require("path");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { toAuthUser } = require("../utils/serializers");
const User = require("../models/User");

const UPLOADS_ROOT = path.join(__dirname, "..", "..");

// Old avatars uploaded to this server are removed when replaced; external
// URLs (e.g. seeded Unsplash photos) are left alone.
const removeLocalFile = (url) => {
  if (url?.startsWith("/uploads/")) fs.unlink(path.join(UPLOADS_ROOT, url), () => {});
};

const sendUser = (res, user) =>
  res.status(200).json({
    success: true,
    data: { user: toAuthUser(user) },
  });

// @route   PATCH /api/account/profile
// @access  Private
// Multipart: name?, location?, avatar (file)?, removeAvatar?
const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, location, uploadedAvatar, removeAvatar } = req.body;

  if (name !== undefined) user.name = name;
  if (location !== undefined) user.location = location;

  if (uploadedAvatar) {
    removeLocalFile(user.avatar);
    user.avatar = uploadedAvatar;
  } else if (removeAvatar) {
    removeLocalFile(user.avatar);
    user.avatar = null;
  }

  await user.save();
  sendUser(res, user);
});

// @route   PATCH /api/account/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect", 400, [
      { field: "currentPassword", message: "Current password is incorrect" },
    ]);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    data: { message: "Password updated" },
  });
});

// @route   PATCH /api/account/preferences
// @access  Private
// Body: { notifications: { orders?, activity?, account? } }
const updatePreferences = asyncHandler(async (req, res) => {
  const user = req.user;
  const changes = req.body.notifications ?? {};

  ["orders", "activity", "account"].forEach((key) => {
    if (typeof changes[key] === "boolean") user.preferences.notifications[key] = changes[key];
  });

  await user.save();
  sendUser(res, user);
});

module.exports = { updateProfile, changePassword, updatePreferences };
