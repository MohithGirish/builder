/*
 * useAuthedApi.js — React hook for authenticated GET requests.
 *
 * Same shape as useApi ({ data, loading, error, refetch }) but routes through
 * AuthContext.authedFetch, so it attaches the Bearer access token AND recovers
 * from a mid-session 401 (silent token refresh + one retry) before calling
 * role-protected endpoints (e.g. the admin APIs). Not a parallel fetch layer —
 * just the standard authed-call pattern wrapped for reuse. Pass
 * { enabled: false } to defer, and refetch() to re-request.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useAuthedApi(path, { enabled = true } = {}) {
  const { authedFetch } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(Boolean(path) && enabled);
  const [error, setError]     = useState(null);
  const [nonce, setNonce]     = useState(0);

  useEffect(() => {
    if (!path || !enabled) { setLoading(false); return undefined; }
    let cancelled = false;

    setLoading(true);
    setError(null);
    authedFetch(path)
      .then((result) => { if (!cancelled) { setData(result); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message || 'Request failed'); setLoading(false); } });

    return () => { cancelled = true; };
    // authedFetch is stable (useCallback); path/enabled/nonce drive refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, enabled, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refetch };
}
