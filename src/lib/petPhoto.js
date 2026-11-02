// Unsplash (imgix) can crop server-side around a focal point. A plain centre
// crop cuts the head off tall photos (most birds), so these photos carry a
// hand-picked point: [x, y, zoom], x/y as 0–1 of the original image.
const FOCUS = {
  'photo-1544923408-75c5cef46f14': [0.45, 0.37], // Scarlet Macaw
  'photo-1552728089-57bdde30beb3': [0.6, 0.42], // Green Parakeet
  'photo-1762849283622-a0d2beeaa4f6': [0.5, 0.36], // African Grey
  'photo-1762849283003-bf79ab31ea9e': [0.5, 0.36], // African Grey (2nd)
  'photo-1654181925544-4b9f45943cc4': [0.6, 0.52, 1.8], // Canary
  'photo-1654181920354-5c4add3989a1': [0.6, 0.52, 1.8], // Canary (2nd)
  'photo-1522858547137-f1dcec554f55': [0.38, 0.42, 2], // Budgie
  'photo-1638078463918-f294d9c31a11': [0.5, 0.62], // Labrador
  'photo-1709025219993-37d2a0a70031': [0.45, 0.36], // Sun Conure
  'photo-1759384278288-14f680d9cae7': [0.55, 0.38], // Cockatiel
};

/**
 * Returns `url` cropped by Unsplash to the frame's aspect ratio (width / height),
 * centred on the animal. Non-Unsplash URLs (user uploads) are returned unchanged.
 */
export function petPhoto(url, aspect, width = 600) {
  if (!url?.startsWith('https://images.unsplash.com/')) return url;
  const photo = new URL(url);
  const params = photo.searchParams;
  params.set('fit', 'crop');
  params.set('w', String(width));
  params.set('h', String(Math.round(width / aspect)));
  const focus = FOCUS[photo.pathname.slice(1)];
  if (focus) {
    const [x, y, zoom = 1] = focus;
    params.set('crop', 'focalpoint');
    params.set('fp-x', String(x));
    params.set('fp-y', String(y));
    params.set('fp-z', String(zoom));
  }
  return photo.toString();
}
