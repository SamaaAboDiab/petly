const asyncHandler = require("../utils/asyncHandler");
const SupportTicket = require("../models/SupportTicket");

// @route   POST /api/support
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { category, subject, message } = req.body;
  const ticket = await SupportTicket.create({ user: req.user._id, category, subject, message });

  res.status(201).json({
    success: true,
    data: { ticket },
  });
});

// @route   GET /api/support/mine
// @access  Private
const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);

  res.status(200).json({
    success: true,
    data: { tickets },
  });
});

module.exports = { createTicket, getMyTickets };
