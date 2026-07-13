/*
 * api.js — Shared backend API base URL and fetch helper.
 *
 * Exports API (the backend origin from VITE_BACKEND_URL; empty string means
 * same-origin, e.g. the Vite dev proxy) and apiFetch(), a thin fetch wrapper
 * that prefixes the base URL, verifies the response is JSON before parsing —
 * so a static host answering with an HTML 404 yields a readable error instead
 * of Safari's "The string did not match the expected pattern" — and throws
 * the backend's error message on non-2xx responses. Resolves to parsed JSON.
 *
 * Also exports cachedFetch() — a GET-only in-memory TTL cache with in-flight
 * de-duplication so revisiting a page doesn't refetch — and invalidate() to
 * drop cached entries after a write. See useApi() (lib/useApi.js) for the hook.
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
  if (!res.ok) {
    // Attach the HTTP status so callers (e.g. AuthContext.authedFetch) can react
    // to a 401 with a token refresh + retry instead of surfacing a raw error.
    const err = new Error(data.error?.message || fallbackError);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ── GET response cache + in-flight de-duplication ────────────────────────────
// A lightweight client cache so navigating back to a page (or two components
// requesting the same resource) doesn't refetch and re-skeleton. GET only;
// mutations bypass it. Call invalidate() after a write that changes cached data.
const _cache    = new Map(); // key -> { data, expiresAt }
const _inflight = new Map(); // key -> Promise (de-dupes concurrent requests)

const _key = (path, options) =>
  options && options.body ? `${path}::${options.body}` : path;

/**
 * GET with an in-memory TTL cache and in-flight de-duplication. Non-GET
 * requests pass straight through to apiFetch (never cached). `ttl` is in ms;
 * `force` bypasses a fresh cache entry and refetches.
 */
export async function cachedFetch(path, options = {}, { ttl = 30000, force = false } = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET') return apiFetch(path, options);

  const key = _key(path, options);
  if (!force) {
    const hit = _cache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.data;
    const pending = _inflight.get(key);
    if (pending) return pending;
  }

  const promise = apiFetch(path, options)
    .then((data) => {
      _cache.set(key, { data, expiresAt: Date.now() + ttl });
      _inflight.delete(key);
      return data;
    })
    .catch((err) => {
      _inflight.delete(key);
      throw err;
    });

  _inflight.set(key, promise);
  return promise;
}

/**
 * Drop cached GET responses. `match` is a string prefix or a RegExp tested
 * against the cache key (the request path); no argument clears everything.
 */
export function invalidate(match) {
  const test =
    match == null               ? () => true
    : match instanceof RegExp   ? (k) => match.test(k)
    :                             (k) => k.startsWith(match);
  for (const k of [..._cache.keys()])    if (test(k)) _cache.delete(k);
  for (const k of [..._inflight.keys()]) if (test(k)) _inflight.delete(k);
}
