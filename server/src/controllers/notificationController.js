const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Notification = require("../models/Notification");

const PAGE_SIZE = 20;

// @route   GET /api/notifications?before=<ISO date>
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.before) filter.createdAt = { $lt: new Date(req.query.before) };

  const [page, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(PAGE_SIZE + 1),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      notifications: page.slice(0, PAGE_SIZE),
      hasMore: page.length > PAGE_SIZE,
      unread,
    },
  });
});

// @route   POST /api/notifications/:id/read
// @access  Private (owner only)
const markRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true });

  if (!result.matchedCount) {
    throw new AppError("Notification not found", 404);
  }

  res.status(200).json({
    success: true,
    data: { id: req.params.id },
  });
});

// @route   POST /api/notifications/read-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });

  res.status(200).json({
    success: true,
    data: { unread: 0 },
  });
});

module.exports = { getNotifications, markRead, markAllRead };
