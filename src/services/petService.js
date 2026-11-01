import { BREEDS } from '@/data/pets';
import { compressImages } from '@/lib/compressImage';
import { assetUrl, request } from './api';

/** API pet -> the shape components use (absolute image URLs, flat sellerId). */
export const toPet = (raw) => ({
  ...raw,
  sellerId: typeof raw.seller === 'object' ? raw.seller?.id : raw.seller,
  images: raw.images.map(assetUrl),
});

export const toSeller = (raw) => raw && { ...raw, avatar: assetUrl(raw.avatar) };

/** Listing form values + photos -> multipart body (empty fields are skipped). */
const toPetForm = async (values, files) => {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) form.append(key, value);
  });
  (await compressImages(files)).forEach((file) => form.append('images', file));
  return form;
};

const getPets = ({ category, query, sort, maxPrice, limit } = {}) =>
  request('/pets', { params: { category, search: query?.trim(), sort, maxPrice, limit } }).then((data) =>
    data.pets.map(toPet),
  );

export const petService = {
  getPets,

  getFeatured: (category = 'all') => getPets({ category, sort: 'featured', limit: 8 }),

  /** Quick search for the command palette. */
  search: (query) => getPets({ query, limit: 6 }),

  /** Accepts an id or a slug. Resolves to `{ pet, seller, related }`. */
  getPetById: (idOrSlug) =>
    request(`/pets/${encodeURIComponent(idOrSlug)}`).then(({ pet, seller, related }) => ({
      pet: toPet(pet),
      seller: toSeller(seller),
      related: related.map(toPet),
    })),

  // Curated list — kept static on purpose (editorial content, not inventory).
  getBreeds: (category = 'all') =>
    Promise.resolve(category === 'all' ? BREEDS : BREEDS.filter((b) => b.category.toLowerCase() === category)),

  getMyListings: () => request('/pets/mine').then((data) => data.pets.map(toPet)),

  /** `values` from the listing form; `files` are optional uploaded photos. */
  createPet: async (values, files = []) =>
    request('/pets', { method: 'POST', body: await toPetForm(values, files) }).then((data) => toPet(data.pet)),

  /** Same fields as createPet; photos are only replaced when new files or a URL are given. */
  updatePet: async (id, values, files = []) =>
    request(`/pets/${id}`, { method: 'PUT', body: await toPetForm(values, files) }).then((data) => toPet(data.pet)),

  deletePet: (id) => request(`/pets/${id}`, { method: 'DELETE' }),

  /** Public seller page: `{ seller, pets }`. */
  getSeller: (sellerId) =>
    request(`/sellers/${sellerId}`).then(({ seller, pets }) => ({ seller: toSeller(seller), pets: pets.map(toPet) })),
};
