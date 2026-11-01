const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { escapeRegex, paginate } = require("../utils/query");
const Order = require("../models/Order");
const Pet = require("../models/Pet");
const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");
const { notify } = require("../services/notificationService");

const CHART_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const pageMeta = (page, limit, total) => ({ page, totalPages: Math.max(Math.ceil(total / limit), 1), total });

// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - (CHART_DAYS - 1) * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);

  const [users, pets, orders, openTickets, revenueAgg, byCategory, byDay, recentOrders] = await Promise.all([
    User.countDocuments(),
    Pet.countDocuments(),
    Order.countDocuments(),
    SupportTicket.countDocuments({ status: "open" }),
    // Cancelled orders don't count as revenue.
    Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, revenue: { $sum: "$total" } } }]),
    Pet.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name").lean(),
  ]);

  // Fill missing days with zeros so the chart always has CHART_DAYS bars.
  const dayMap = new Map(byDay.map((d) => [d._id, d]));
  const ordersByDay = Array.from({ length: CHART_DAYS }, (_, i) => {
    const date = new Date(since.getTime() + i * DAY_MS).toISOString().slice(0, 10);
    return { date, orders: dayMap.get(date)?.orders ?? 0, revenue: dayMap.get(date)?.revenue ?? 0 };
  });

  res.status(200).json({
    success: true,
    data: {
      totals: { users, pets, orders, openTickets, revenue: revenueAgg[0]?.revenue ?? 0 },
      petsByCategory: byCategory.map((c) => ({ id: c._id, count: c.count })),
      ordersByDay,
      recentOrders: recentOrders.map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber,
        buyer: o.user?.name ?? "Deleted user",
        items: o.items.length,
        total: o.total,
        createdAt: o.createdAt,
      })),
    },
  });
});

// @route   GET /api/admin/pets?search=&page=
// @access  Private/Admin
const getPets = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const pattern = new RegExp(escapeRegex(req.query.search.trim()), "i");
    filter.$or = [{ name: pattern }, { location: pattern }];
  }
  const { page, limit, skip } = paginate(req.query);

  const [pets, total] = await Promise.all([
    Pet.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("seller", "name email verified"),
    Pet.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: { pets, ...pageMeta(page, limit, total) },
  });
});

// @route   GET /api/admin/orders?status=&page=
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const { page, limit, skip } = paginate(req.query);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("seller", "name email"),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: { orders, ...pageMeta(page, limit, total) },
  });
});

// @route   GET /api/admin/tickets?status=open|resolved&page=
// @access  Private/Admin
const getTickets = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const { page, limit, skip } = paginate(req.query);

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "name email"),
    SupportTicket.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: { tickets, ...pageMeta(page, limit, total) },
  });
});

// @route   PATCH /api/admin/tickets/:id
// @access  Private/Admin
// Body: { reply?, status? }. A new reply notifies the user.
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id).populate("user", "name email");
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const { reply, status } = req.body;
  const newReply = reply !== undefined && reply !== ticket.reply;
  if (reply !== undefined) ticket.reply = reply;
  if (status) ticket.status = status;
  await ticket.save();

  if (newReply && ticket.user) {
    notify(ticket.user._id, {
      type: "system",
      title: "Support replied to your request",
      body: ticket.subject,
      link: "/app/help",
    });
  }

  res.status(200).json({
    success: true,
    data: { ticket },
  });
});

module.exports = { getStats, getPets, getOrders, getTickets, updateTicket };
