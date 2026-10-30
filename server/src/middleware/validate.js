const fs = require("fs");
const { validationResult } = require("express-validator");

// Runs after an express-validator chain. If any rule failed, responds with
// the standard error shape instead of letting the request reach the controller.
const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    // Multer already wrote any uploaded images to disk - don't leave orphans
    // behind for a request we're rejecting.
    req.files?.forEach((file) => fs.unlink(file.path, () => {}));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
