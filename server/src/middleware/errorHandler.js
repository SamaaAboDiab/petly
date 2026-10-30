// Central error handler - every error in the app (thrown AppErrors, Mongoose
// errors, or anything unexpected) ends up here so the response shape sent to
// the client is always consistent:
// { success: false, message: "...", errors: [] }
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";
  let errors = err.errors || [];

  // Mongoose validation error (e.g. schema-level `required`/`minlength` checks
  // that weren't already caught by express-validator).
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error (e.g. email unique index).
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`;
    errors = [];
  }

  // Malformed MongoDB ObjectId in a route param.
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
    errors = [];
  }

  // File upload errors from multer (see src/middleware/upload.js): wrong
  // mime type, file too large, too many files, etc.
  if (err.name === "MulterError") {
    statusCode = 400;
    message =
      err.code === "LIMIT_UNEXPECTED_FILE"
        ? "Only image files (jpeg, png, webp, gif) are allowed"
        : err.message;
    errors = [];
  }

  // Origin rejected by the CORS whitelist in app.js.
  if (err.message === "Not allowed by CORS") {
    statusCode = 403;
    errors = [];
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = errorHandler;
