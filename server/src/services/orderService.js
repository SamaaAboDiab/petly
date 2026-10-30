const AppError = require("../utils/AppError");
const { AVAILABLE_FILTER, DELIVERY_FEE, ORDER_TRANSITIONS, PROMO_CODES } = require("../config/constants");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Pet = require("../models/Pet");
const { notify } = require("./notificationService");

const normalizeCode = (code) => (code ? String(code).trim().toUpperCase() : null);
const money = (value) => `EGP ${value.toLocaleString("en-US")}`;

/** Throws for an unknown code; returns `{ code, rate }` (or null for no code). */
const resolvePromo = (rawCode) => {
  const code = normalizeCode(rawCode);
  if (!code) return null;
  if (!PROMO_CODES[code]) throw new AppError("Invalid promo code", 400);
  return { code, rate: PROMO_CODES[code] };
};

const releasePets = (petIds) => Pet.updateMany({ _id: { $in: petIds } }, { status: "available", soldAt: null });

/**
 * Marks each pet sold, one conditional update at a time, so two buyers can
 * never get the same animal. If any pet was taken in the meantime, the ones
 * already reserved by this checkout are released again.
 */
const reservePets = async (pets) => {
  const reserved = [];
  for (const pet of pets) {
    const { modifiedCount } = await Pet.updateOne(
      { _id: pet._id, ...AVAILABLE_FILTER },
      { status: "sold", soldAt: new Date() }
    );
    if (!modifiedCount) {
      await releasePets(reserved);
      throw new AppError(`${pet.name} was just adopted by someone else`, 409);
    }
    reserved.push(pet._id);
  }
  return reserved;
};

/**
 * Checkout: validates the pets, reserves them, and creates one order per
 * seller (each seller confirms and delivers on their own). Prices always come
 * from the database. Returns the created orders.
 */
const placeOrder = async (buyer, petIds, rawPromoCode) => {
  const promo = resolvePromo(rawPromoCode);
  const uniqueIds = [...new Set(petIds.map(String))];

  const pets = await Pet.find({ _id: { $in: uniqueIds } });
  if (pets.length !== uniqueIds.length) {
    throw new AppError("One of the pets in your order is no longer listed", 409);
  }
  const own = pets.find((pet) => pet.seller.equals(buyer._id));
  if (own) {
    throw new AppError(`You can't buy your own listing (${own.name})`, 400);
  }
  const sold = pets.find((pet) => pet.status === "sold");
  if (sold) {
    throw new AppError(`${sold.name} has already found a home`, 409);
  }

  const reserved = await reservePets(pets);

  const bySeller = new Map();
  pets.forEach((pet) => {
    const key = String(pet.seller);
    bySeller.set(key, [...(bySeller.get(key) ?? []), pet]);
  });

  let orders;
  try {
    orders = await Order.create(
      [...bySeller.entries()].map(([sellerId, sellerPets]) => {
        const subtotal = sellerPets.reduce((sum, pet) => sum + pet.price, 0);
        const discount = promo ? Math.round(subtotal * promo.rate) : 0;
        return {
          user: buyer._id,
          seller: sellerId,
          items: sellerPets.map((pet) => ({ pet: pet._id, name: pet.name, image: pet.images[0], price: pet.price })),
          subtotal,
          discount,
          deliveryFee: DELIVERY_FEE,
          total: subtotal - discount + DELIVERY_FEE,
          promoCode: promo?.code ?? null,
        };
      })
    );
  } catch (error) {
    await releasePets(reserved);
    throw error;
  }

  // Ordered pets leave the cart; anything the user didn't select stays.
  await Cart.updateOne({ user: buyer._id }, { $pull: { items: { pet: { $in: reserved } } } });

  const grandTotal = orders.reduce((sum, order) => sum + order.total, 0);
  notify(buyer._id, {
    type: "order",
    title: orders.length === 1 ? `Order #${orders[0].orderNumber} placed` : `${orders.length} orders placed`,
    body: `${pets.length} ${pets.length === 1 ? "pet" : "pets"} • ${money(grandTotal)} — waiting for the seller to confirm.`,
    link: "/app/orders",
  });
  orders.forEach((order) => {
    notify(order.seller, {
      type: "sale",
      title: `${buyer.name} ordered your ${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1}` : ""}`,
      body: `Order #${order.orderNumber} — confirm it to let the buyer know.`,
      link: "/app/orders?tab=sales",
    });
  });

  return orders;
};

const STATUS_MESSAGES = {
  confirmed: (order) => ({ title: `Order #${order.orderNumber} confirmed`, body: "The seller will contact you about delivery." }),
  delivered: (order) => ({ title: `Order #${order.orderNumber} delivered`, body: "Enjoy your new friend! 🐾" }),
  cancelled: (order, byBuyer) => ({
    title: `Order #${order.orderNumber} cancelled`,
    body: byBuyer ? "The buyer cancelled this order. Your pet is listed again." : "The seller cancelled this order.",
  }),
};

/**
 * Moves an order to `nextStatus` if the actor's role allows it
 * (see ORDER_TRANSITIONS). Cancelling puts the pets back on sale.
 */
const changeStatus = async (orderId, actor, nextStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);

  const isBuyer = order.user.equals(actor._id);
  const isSeller = order.seller?.equals(actor._id) || actor.role === "admin";
  if (!isBuyer && !isSeller) throw new AppError("Order not found", 404);

  const allowed = [
    ...(isSeller ? ORDER_TRANSITIONS.seller[order.status] ?? [] : []),
    ...(isBuyer ? ORDER_TRANSITIONS.buyer[order.status] ?? [] : []),
  ];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(`An order that is ${order.status} can't be marked ${nextStatus}`, 400);
  }

  order.status = nextStatus;
  order.statusHistory.push({ status: nextStatus, by: actor._id });
  await order.save();

  if (nextStatus === "cancelled") {
    await releasePets(order.items.map((item) => item.pet));
  }

  // Tell the other side.
  const byBuyer = isBuyer && !order.seller?.equals(actor._id);
  const recipient = byBuyer ? order.seller : order.user;
  if (recipient) {
    notify(recipient, {
      type: byBuyer ? "sale" : "order",
      ...STATUS_MESSAGES[nextStatus](order, byBuyer),
      link: byBuyer ? "/app/orders?tab=sales" : "/app/orders",
    });
  }

  return order;
};

module.exports = { resolvePromo, placeOrder, changeStatus };
