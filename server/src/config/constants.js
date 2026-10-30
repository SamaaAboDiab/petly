// Business rules shared by models, validators and controllers. Keeping them in
// one place means the API can't drift out of sync with itself (e.g. a category
// accepted by the validator but rejected by the schema).

const CATEGORIES = ["dogs", "cats", "birds"];
const GENDERS = ["Male", "Female"];

// The frontend shows the same fee in its order summary preview, but the order
// total is always recomputed here — the client never decides what it pays.
const DELIVERY_FEE = 100;

// code -> discount rate
const PROMO_CODES = {
  PETLY10: 0.1,
  HAPPYPET: 0.15,
};

// Used when a seller lists a pet without uploading a photo or giving a URL.
const DEFAULT_PET_IMAGES = {
  dogs: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
  cats: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
  birds: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80",
};

const HEALTH_FEATURES = ["vaccinated", "dewormed", "healthCheck", "pedigree"];

const NOTIFICATION_TYPES = ["order", "sale", "favorite", "follow", "verified", "system"];

// Which user preference switch controls each type. Types not listed here
// (e.g. "system") are always delivered.
const NOTIFICATION_PREFERENCE = {
  order: "orders",
  sale: "orders",
  favorite: "activity",
  follow: "activity",
  verified: "account",
};

const SUPPORT_CATEGORIES = ["order", "listing", "account", "payment", "other"];

// A listing is one animal: once ordered it is "sold" and leaves the shop.
const PET_STATUSES = ["available", "sold"];
// Matches pets that can be bought. `$ne` (not `: "available"`) so listings
// created before the status field existed still count as available.
const AVAILABLE_FILTER = { status: { $ne: "sold" } };

const ORDER_STATUSES = ["pending", "confirmed", "delivered", "cancelled"];

// Who may move an order from one status to the next. Admins act as sellers.
const ORDER_TRANSITIONS = {
  seller: { pending: ["confirmed", "cancelled"], confirmed: ["delivered", "cancelled"] },
  buyer: { pending: ["cancelled"] },
};

module.exports = {
  PET_STATUSES,
  AVAILABLE_FILTER,
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
  SUPPORT_CATEGORIES,
  NOTIFICATION_TYPES,
  NOTIFICATION_PREFERENCE,
  CATEGORIES,
  GENDERS,
  DELIVERY_FEE,
  PROMO_CODES,
  DEFAULT_PET_IMAGES,
  HEALTH_FEATURES,
};
