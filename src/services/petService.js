import { BREEDS, CATEGORIES } from '@/data/pets';
import { assetUrl, request } from './api';

/** API pet -> the shape components use (absolute image URLs, flat sellerId). */
export const toPet = (raw) => ({
  ...raw,
  sellerId: typeof raw.seller === 'object' ? raw.seller?.id : raw.seller,
  images: raw.images.map(assetUrl),
});

export const toSeller = (raw) => raw && { ...raw, avatar: assetUrl(raw.avatar) };

/** Listing form values + photos -> multipart body (empty fields are skipped). */
const toPetForm = (values, files) => {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) form.append(key, value);
  });
  files.forEach((file) => form.append('images', file));
  return form;
};

const getPets = ({ category, query, sort, limit } = {}) =>
  request('/pets', { params: { category, search: query?.trim(), sort, limit } }).then((data) =>
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

  /** Category cards: static labels/covers merged with live counts. */
  getCategories: () =>
    request('/pets/categories').then(({ categories }) =>
      CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
        ...c,
        count: categories.find((item) => item.id === c.id)?.count ?? 0,
      })),
    ),

  // Curated list — kept static on purpose (editorial content, not inventory).
  getBreeds: () => Promise.resolve(BREEDS),

  getMyListings: () => request('/pets/mine').then((data) => data.pets.map(toPet)),

  /** `values` from the listing form; `files` are optional uploaded photos. */
  createPet: (values, files = []) =>
    request('/pets', { method: 'POST', body: toPetForm(values, files) }).then((data) => toPet(data.pet)),

  /** Same fields as createPet; photos are only replaced when new files or a URL are given. */
  updatePet: (id, values, files = []) =>
    request(`/pets/${id}`, { method: 'PUT', body: toPetForm(values, files) }).then((data) => toPet(data.pet)),

  deletePet: (id) => request(`/pets/${id}`, { method: 'DELETE' }),

  /** Public seller page: `{ seller, pets }`. */
  getSeller: (sellerId) =>
    request(`/sellers/${sellerId}`).then(({ seller, pets }) => ({ seller: toSeller(seller), pets: pets.map(toPet) })),
};
