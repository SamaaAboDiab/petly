const Pet = require("../models/Pet");

// The exact user shape the frontend session needs - never the whole document
// (which carries favorites, role internals, etc.).
const toAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  location: user.location,
  avatar: user.avatar,
  verified: user.verified,
  preferences: {
    notifications: {
      orders: user.preferences?.notifications?.orders ?? true,
      activity: user.preferences?.notifications?.activity ?? true,
      account: user.preferences?.notifications?.account ?? true,
    },
  },
  createdAt: user.createdAt,
});

// Public seller card data: identity + listing stats computed from their pets
// in a single aggregate (instead of one count query per seller).
const toSellerProfiles = async (users) => {
  const ids = users.map((user) => user._id);
  const stats = await Pet.aggregate([
    { $match: { seller: { $in: ids } } },
    { $group: { _id: "$seller", listings: { $sum: 1 }, rating: { $avg: "$rating" } } },
  ]);
  const statsById = new Map(stats.map((s) => [String(s._id), s]));

  return users.map((user) => {
    const s = statsById.get(String(user._id));
    return {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      verified: user.verified,
      location: user.location,
      joined: new Date(user.createdAt).getFullYear(),
      listings: s?.listings ?? 0,
      rating: s ? Math.round(s.rating * 10) / 10 : null,
    };
  });
};

module.exports = { toAuthUser, toSellerProfiles };
