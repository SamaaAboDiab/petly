const fs = require("fs");
const path = require("path");

const SERVER_ROOT = path.join(__dirname, "..", "..");
const UPLOADS_DIR = path.join(SERVER_ROOT, "uploads");

// On Vercel the filesystem is read-only, so uploads go to Vercel Blob
// whenever its token is configured; locally they're written to uploads/.
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const BLOB_HOST = ".blob.vercel-storage.com";

const isBlobUrl = (url) => {
  try {
    return new URL(url).hostname.endsWith(BLOB_HOST);
  } catch {
    return false;
  }
};

/** Stores one image and resolves to its public URL. */
const saveUpload = async (folder, filename, buffer, contentType) => {
  if (useBlob()) {
    const { put } = require("@vercel/blob");
    const blob = await put(`${folder}/${filename}`, buffer, { access: "public", contentType });
    return blob.url;
  }
  const dir = path.join(UPLOADS_DIR, folder);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
};

/**
 * Deletes images this server stored (in uploads/ or Vercel Blob). External
 * URLs (e.g. the Unsplash photos in the seed data) are ignored. Never throws:
 * a failed cleanup must not fail the request that triggered it.
 */
const removeUploads = (urls = []) => {
  const strings = urls.filter((url) => typeof url === "string");

  strings
    .filter((url) => url.startsWith("/uploads/"))
    .forEach((url) => {
      const filePath = path.join(SERVER_ROOT, url);
      // Guard against "../" tricks: only ever delete inside uploads/.
      if (!filePath.startsWith(UPLOADS_DIR + path.sep)) return;
      fs.unlink(filePath, () => {});
    });

  const blobs = strings.filter(isBlobUrl);
  if (blobs.length && useBlob()) {
    const { del } = require("@vercel/blob");
    del(blobs).catch((error) => console.error(`Blob cleanup failed: ${error.message}`));
  }
};

module.exports = { saveUpload, removeUploads, isBlobUrl };
