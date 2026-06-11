/*
 * api.js — Shared backend API base URL and fetch helper.
 *
 * Exports API (the backend origin from VITE_BACKEND_URL; empty string means
 * same-origin, e.g. the Vite dev proxy) and apiFetch(), a thin fetch wrapper
 * that prefixes the base URL, verifies the response is JSON before parsing —
 * so a static host answering with an HTML 404 yields a readable error instead
 * of Safari's "The string did not match the expected pattern" — and throws
 * the backend's error message on non-2xx responses. Resolves to parsed JSON.
 */
export const API = import.meta.env.VITE_BACKEND_URL || '';

export async function apiFetch(path, options = {}, fallbackError = 'Something went wrong.') {
  let res;
  try {
    res = await fetch(`${API}${path}`, options);
  } catch {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Could not reach the server. Please try again later.');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || fallbackError);
  return data;
}
