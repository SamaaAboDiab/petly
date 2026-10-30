// Shared helpers for list endpoints.

const MAX_LIMIT = 100;

// Search terms are matched as literal text, never as a regex pattern.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const paginate = (query, defaultLimit = 20) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || defaultLimit, 1), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};

module.exports = { escapeRegex, paginate };
