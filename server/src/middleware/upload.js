const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const UPLOADS_ROOT = path.join(__dirname, "..", "..", "uploads");

// The extension comes from this map — never from the client's file name —
// so a file can't be uploaded as "image/png" but saved and served as ".html".
const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  if (!EXTENSIONS[file.mimetype]) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }
  cb(null, true);
};

/**
 * Builds an image-upload middleware that saves into uploads/<folder> and
 * copies the public URLs into req.body[bodyKey], so validators and
 * controllers don't need to know whether the request was JSON or multipart.
 */
const createImageUpload = ({ folder, field, maxCount, bodyKey }) => {
  const dir = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, dir),
      filename: (req, file, cb) =>
        cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${EXTENSIONS[file.mimetype]}`),
    }),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });

  const attachUrls = (req, res, next) => {
    const files = req.files ?? (req.file ? [req.file] : []);
    if (files.length) {
      const urls = files.map((file) => `/uploads/${folder}/${file.filename}`);
      req.body[bodyKey] = maxCount === 1 ? urls[0] : urls;
      // validate.js cleans up req.files when a request is rejected.
      req.files = files;
    }
    next();
  };

  const parse = maxCount === 1 ? upload.single(field) : upload.array(field, maxCount);
  return [parse, attachUrls];
};

const uploadPetImages = createImageUpload({ folder: "pets", field: "images", maxCount: 5, bodyKey: "uploadedImages" });
const uploadAvatar = createImageUpload({ folder: "avatars", field: "avatar", maxCount: 1, bodyKey: "uploadedAvatar" });

module.exports = { uploadPetImages, uploadAvatar };
