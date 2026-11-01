const { validationResult } = require("express-validator");
const { removeUploads } = require("../utils/files");

// Runs after an express-validator chain. If any rule failed, responds with
// the standard error shape instead of letting the request reach the controller.
const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    // The upload middleware already stored any images - don't leave orphans
    // behind for a request we're rejecting.
    removeUploads(req.uploadedUrls);

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
