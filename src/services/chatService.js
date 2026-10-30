import { assetUrl, request } from './api';

/** API conversation -> UI shape (absolute image URLs). */
export const toConversation = (raw) => ({
  ...raw,
  other: raw.other && { ...raw.other, avatar: assetUrl(raw.other.avatar) },
  pet: raw.pet && { ...raw.pet, image: assetUrl(raw.pet.image) },
});

export const chatService = {
  list: () => request('/conversations').then((data) => data.conversations.map(toConversation)),

  /** Opens (or reuses) the conversation with a seller. */
  start: ({ sellerId, petId }) =>
    request('/conversations', { method: 'POST', body: { sellerId, petId } }).then((data) =>
      toConversation(data.conversation),
    ),

  /** One page, oldest first: `{ conversation, messages, hasMore }`. */
  messages: (conversationId, before) =>
    request(`/conversations/${conversationId}/messages`, { params: { before } }).then((data) => ({
      ...data,
      conversation: toConversation(data.conversation),
    })),

  send: (conversationId, text) =>
    request(`/conversations/${conversationId}/messages`, { method: 'POST', body: { text } }).then(
      (data) => data.message,
    ),

  markRead: (conversationId) => request(`/conversations/${conversationId}/read`, { method: 'POST' }),
};
