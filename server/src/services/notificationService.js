const Notification = require("../models/Notification");
const User = require("../models/User");
const { NOTIFICATION_PREFERENCE } = require("../config/constants");
const { emitToUser } = require("../socket");

// Repeated actions (favorite → unfavorite → favorite) within this window
// produce only one notification.
const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Creates an in-app notification and pushes it live over the socket.
 * Never throws: a failed notification must not fail the action that caused it.
 */
const notify = async (userId, { type, title, body = "", link = null, dedupeKey = null }) => {
  try {
    // Respect the recipient's preferences at send time.
    const preference = NOTIFICATION_PREFERENCE[type];
    if (preference) {
      const user = await User.findById(userId).select("preferences").lean();
      if (!user || user.preferences?.notifications?.[preference] === false) return null;
    }

    if (dedupeKey) {
      const duplicate = await Notification.exists({
        user: userId,
        dedupeKey,
        createdAt: { $gt: new Date(Date.now() - DEDUPE_WINDOW_MS) },
      });
      if (duplicate) return null;
    }

    const notification = await Notification.create({ user: userId, type, title, body, link, dedupeKey });
    emitToUser(userId, "notification:new", notification.toJSON());
    return notification;
  } catch (error) {
    console.error("notify failed:", error.message);
    return null;
  }
};

module.exports = { notify };
