import { assetUrl, request } from './api';

const withAvatar = (user) => user && typeof user === 'object' ? { ...user, avatar: assetUrl(user.avatar) } : user;

const toOrder = (order) => ({
  ...order,
  user: withAvatar(order.user),
  seller: withAvatar(order.seller),
  items: order.items.map((item) => ({ ...item, image: assetUrl(item.image) })),
});

export const orderService = {
  /** Orders I placed (with the seller). */
  mine: () => request('/orders/mine').then((data) => data.orders.map(toOrder)),
  /** Orders for pets I listed (with the buyer). */
  sales: () => request('/orders/sales').then((data) => data.orders.map(toOrder)),
  /** Resolves to `{ code, rate }` or throws for an unknown code. */
  validatePromo: (code) => request('/orders/promo', { method: 'POST', body: { code } }),
  /** `petIds` -> one order per seller. Totals are computed by the server. */
  create: ({ petIds, promoCode }) =>
    request('/orders', { method: 'POST', body: { items: petIds.map((petId) => ({ petId })), promoCode } }).then(
      (data) => data.orders.map(toOrder),
    ),
  updateStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, { method: 'PATCH', body: { status } }).then((data) => toOrder(data.order)),
};
