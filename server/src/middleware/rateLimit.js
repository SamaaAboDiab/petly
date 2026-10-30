const rateLimit = require("express-rate-limit");

const message = (text) => ({ success: false, message: text, errors: [] });

// General ceiling for the whole API.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: message("Too many requests, please try again later"),
});

// Much stricter on login/register to slow down password guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: message("Too many attempts, please try again in 15 minutes"),
});

module.exports = { apiLimiter, authLimiter };
