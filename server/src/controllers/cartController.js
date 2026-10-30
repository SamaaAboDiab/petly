const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Cart = require("../models/Cart");
const Pet = require("../models/Pet");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// Populates cart items with their pet and adds the totals the frontend needs.
// Prices are read live on every request, so a price change shows immediately.
// Pets sold to someone else stay in the cart (flagged by pet.status) so the
// user sees why they disappeared, but they don't count towards the total.
const formatCart = async (cart) => {
  await cart.populate("items.pet");

  // A pet deleted by its seller since it was added is dropped silently.
  const items = cart.items.filter((item) => item.pet).map((item) => ({ pet: item.pet, addedAt: item.addedAt }));
  const available = items.filter((item) => item.pet.status !== "sold");

  return {
    id: cart._id,
    items,
    totalItems: available.length,
    totalPrice: available.reduce((sum, item) => sum + item.pet.price, 0),
  };
};

const hasItem = (cart, petId) => cart.items.some((item) => item.pet.toString() === petId);

const sendCart = async (res, cart) =>
  res.status(200).json({
    success: true,
    data: { cart: await formatCart(cart) },
  });

// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  await sendCart(res, await getOrCreateCart(req.user._id));
});

// @route   POST /api/cart/items
// @access  Private
// Body: { petId }. Adding a pet that's already in the cart is a no-op.
const addItem = asyncHandler(async (req, res) => {
  const { petId } = req.body;

  const pet = await Pet.findById(petId).select("seller status");
  if (!pet) {
    throw new AppError("Pet not found", 404);
  }
  if (pet.seller.equals(req.user._id)) {
    throw new AppError("You can't buy your own listing", 400);
  }
  if (pet.status === "sold") {
    throw new AppError("This pet has already found a home", 409);
  }

  const cart = await getOrCreateCart(req.user._id);
  if (!hasItem(cart, petId)) {
    cart.items.push({ pet: petId });
    await cart.save();
  }
  await sendCart(res, cart);
});

// @route   DELETE /api/cart/items/:petId
// @access  Private
const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  if (!hasItem(cart, req.params.petId)) {
    throw new AppError("Item not found in cart", 404);
  }

  cart.items = cart.items.filter((item) => item.pet.toString() !== req.params.petId);
  await cart.save();
  await sendCart(res, cart);
});

// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  await sendCart(res, cart);
});

module.exports = { getCart, addItem, removeItem, clearCart };
