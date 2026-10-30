const AppError = require("../utils/AppError");

// Catches any request that didn't match a route.
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = notFound;
