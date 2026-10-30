import { request } from './api';
import { toPet } from './petService';

/** API cart -> `[{ pet }]`. Every cart endpoint returns the full cart. */
const toItems = (data) => data.cart.items.map((item) => ({ pet: toPet(item.pet) }));

export const cartService = {
  get: () => request('/cart').then(toItems),
  add: (petId) => request('/cart/items', { method: 'POST', body: { petId } }).then(toItems),
  remove: (petId) => request(`/cart/items/${petId}`, { method: 'DELETE' }).then(toItems),
  clear: () => request('/cart', { method: 'DELETE' }).then(toItems),
};
