const fs = require("fs");
const path = require("path");

const SERVER_ROOT = path.join(__dirname, "..", "..");
const UPLOADS_DIR = path.join(SERVER_ROOT, "uploads");

/**
 * Deletes files this server stored under /uploads. External URLs (e.g. the
 * Unsplash photos in the seed data) are ignored. Never throws: a missing file
 * must not fail the request that triggered the cleanup.
 */
const removeUploads = (urls = []) => {
  urls
    .filter((url) => typeof url === "string" && url.startsWith("/uploads/"))
    .forEach((url) => {
      const filePath = path.join(SERVER_ROOT, url);
      // Guard against "../" tricks: only ever delete inside uploads/.
      if (!filePath.startsWith(UPLOADS_DIR + path.sep)) return;
      fs.unlink(filePath, () => {});
    });
};

module.exports = { removeUploads };
