import { request } from './api';
import { toPet, toSeller } from './petService';

export const favoriteService = {
  /** Resolves to `{ pets, sellers }`. */
  get: () =>
    request('/favorites').then((data) => ({
      pets: data.pets.map(toPet),
      sellers: data.sellers.map(toSeller),
    })),
  togglePet: (petId) => request(`/favorites/pets/${petId}`, { method: 'POST' }),
  toggleSeller: (sellerId) => request(`/favorites/sellers/${sellerId}`, { method: 'POST' }),
  clear: (type) => request(`/favorites/${type}`, { method: 'DELETE' }),
};
