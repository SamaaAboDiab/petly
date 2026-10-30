const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const { resolvePromo, placeOrder, changeStatus } = require("../services/orderService");

const COUNTERPART = "name avatar verified";

// @route   POST /api/orders/promo
// @access  Private
// Lets the cart preview a discount. The real discount is recomputed when the
// order is placed - this endpoint only answers "is this code valid?".
const validatePromo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: resolvePromo(req.body.code),
  });
});

// @route   POST /api/orders
// @access  Private
// Body: { items: [{ petId }], promoCode? } -> one order per seller.
const createOrder = asyncHandler(async (req, res) => {
  const orders = await placeOrder(
    req.user,
    req.body.items.map((item) => item.petId),
    req.body.promoCode
  );
  // Same shape as GET /orders/mine, so the client can show them right away.
  await Order.populate(orders, { path: "seller", select: COUNTERPART });

  res.status(201).json({
    success: true,
    data: { orders },
  });
});

// @route   GET /api/orders/mine
// @access  Private — orders I placed
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("seller", COUNTERPART);

  res.status(200).json({
    success: true,
    data: { orders },
  });
});

// @route   GET /api/orders/sales
// @access  Private — orders for pets I listed
const getMySales = asyncHandler(async (req, res) => {
  const orders = await Order.find({ seller: req.user._id }).sort({ createdAt: -1 }).populate("user", COUNTERPART);

  res.status(200).json({
    success: true,
    data: { orders },
  });
});

// @route   PATCH /api/orders/:id/status
// @access  Private (buyer: cancel while pending; seller/admin: confirm, deliver, cancel)
const updateStatus = asyncHandler(async (req, res) => {
  const order = await changeStatus(req.params.id, req.user, req.body.status);
  await order.populate([
    { path: "seller", select: COUNTERPART },
    { path: "user", select: COUNTERPART },
  ]);

  res.status(200).json({
    success: true,
    data: { order },
  });
});

module.exports = { validatePromo, createOrder, getMyOrders, getMySales, updateStatus };
