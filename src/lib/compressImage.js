// Photos are resized in the browser before upload: phone pictures are often
// 5–10MB, and the hosted API accepts at most ~4.5MB per request.
const MAX_SIDE = 1600;
const QUALITY = 0.85;

/** Resolves to a smaller JPEG copy of `file`, or `file` itself when that isn't smaller (or it's a GIF). */
export async function compressImage(file, maxSide = MAX_SIDE) {
  if (!file?.type?.startsWith('image/') || file.type === 'image/gif') return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  // JPEG has no transparency: paint a white background for PNGs.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
}

export const compressImages = (files) => Promise.all(files.map((file) => compressImage(file)));
