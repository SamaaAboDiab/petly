import { authStorage } from './authStorage';

/**
 * The single network layer. Every service goes through `request`, which adds
 * the auth token, encodes the body, and turns the API's error shape
 * `{ success: false, message, errors }` into a thrown ApiError.
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const API_ORIGIN = new URL(BASE_URL, window.location.origin).origin;

export const UNAUTHORIZED_EVENT = 'petly:unauthorized';

export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/** Uploaded images are stored as "/uploads/..." paths on the API server. */
export const assetUrl = (path) => (path?.startsWith('/uploads/') ? `${API_ORIGIN}${path}` : path);

const buildUrl = (path, params) => {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  return url;
};

export async function request(path, { method = 'GET', body, params } = {}) {
  const token = authStorage.getToken();
  const isForm = body instanceof FormData;

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Can’t reach the server. Make sure the API is running.');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    // Expired or revoked session — let AuthContext sign the user out.
    if (response.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));

    const errors = payload?.errors ?? [];
    throw new ApiError(errors[0]?.message ?? payload?.message ?? 'Something went wrong', response.status, errors);
  }

  return payload.data;
}
