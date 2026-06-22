/*
 * useApi.js — React hook for cached GET requests.
 *
 * Thin wrapper over cachedFetch (lib/api) that manages { data, loading, error }
 * for a GET endpoint, de-dupes/caches across navigations, and exposes refetch()
 * to force a fresh request (bypassing the cache). Pass { enabled: false } to
 * defer the request, and { ttl } (ms) to tune freshness. Ignores responses that
 * arrive after the path changed or the component unmounted (no stale state).
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedFetch } from './api';

export function useApi(path, { ttl = 30000, enabled = true } = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(Boolean(path) && enabled);
  const [error, setError]     = useState(null);
  const [nonce, setNonce]     = useState(0);
  const forceRef = useRef(false);

  useEffect(() => {
    if (!path || !enabled) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    const force = forceRef.current;
    forceRef.current = false;

    setLoading(true);
    setError(null);
    cachedFetch(path, {}, { ttl, force })
      .then((result) => {
        if (!cancelled) { setData(result); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) { setError(err.message || 'Request failed'); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [path, enabled, ttl, nonce]);

  const refetch = useCallback(() => {
    forceRef.current = true;
    setNonce((n) => n + 1);
  }, []);

  return { data, loading, error, refetch };
}
