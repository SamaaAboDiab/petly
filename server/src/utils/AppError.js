// Custom error class so controllers can `throw new AppError(...)` and have
// the central error handler (src/middleware/errorHandler.js) turn it into
// the standard { success: false, message, errors } response shape.
class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
