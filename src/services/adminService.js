import { assetUrl, request } from './api';
import { toPet } from './petService';

const withAvatar = (user) => user && { ...user, avatar: assetUrl(user.avatar) };

export const adminService = {
  stats: () => request('/admin/stats'),

  users: ({ search, page }) =>
    request('/users', { params: { search, page } }).then((data) => ({ ...data, users: data.users.map(withAvatar) })),
  setVerified: (userId, verified) => request(`/users/${userId}/verify`, { method: 'PATCH', body: { verified } }),
  deleteUser: (userId) => request(`/users/${userId}`, { method: 'DELETE' }),

  pets: ({ search, page }) =>
    request('/admin/pets', { params: { search, page } }).then((data) => ({ ...data, pets: data.pets.map(toPet) })),
  deletePet: (petId) => request(`/pets/${petId}`, { method: 'DELETE' }),

  orders: ({ status, page }) => request('/admin/orders', { params: { status, page } }),

  tickets: ({ status, page }) => request('/admin/tickets', { params: { status, page } }),
  updateTicket: (ticketId, { reply, status }) =>
    request(`/admin/tickets/${ticketId}`, { method: 'PATCH', body: { reply, status } }).then((data) => data.ticket),
};
