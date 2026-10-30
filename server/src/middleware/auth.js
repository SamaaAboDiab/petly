const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const User = require("../models/User");

// Verifies the JWT sent in `Authorization: Bearer <token>`, loads the
// corresponding user, and attaches it to req.user for downstream handlers.
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Not authorized, no token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Not authorized, token expired"
        : "Not authorized, invalid token";
    throw new AppError(message, 401);
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError("Not authorized, user no longer exists", 401);
  }

  req.user = user;
  next();
});

// Must run after `protect`. Returns 403 (not 401) because the user IS
// authenticated - they just don't have permission for this resource.
const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new AppError("Forbidden: admin access required", 403);
  }
  next();
};

module.exports = { protect, isAdmin };
