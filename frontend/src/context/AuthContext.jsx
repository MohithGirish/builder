/*
 * AuthContext.jsx — Global authentication and session context.
 *
 * Provides user state, JWT access/refresh token management, and onboarding
 * completion tracking to the entire application via React Context. Exposes
 * login, register, logout, setOnboardingRole, completeOnboarding, and
 * savePreferences actions. Session is persisted to localStorage; on mount
 * the refresh token is exchanged for a new access token to restore the
 * session, then the user snapshot is refreshed from the server. Exposes the
 * live accessToken (mirrored to state for the SocketProvider) and refreshUser().
 * Also exports the useAuth() convenience hook.
 */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, invalidate } from '../lib/api';
import { isEinfraBuilder } from '../data/realProjects';

const API = import.meta.env.VITE_BACKEND_URL || '';

const AuthContext = createContext(null);

function getUserId() {
  try {
    const u = localStorage.getItem('builderai_u');
    return u ? JSON.parse(u).id : null;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState(() => {
    const uid = getUserId();
    if (!uid) return null;
    try { return JSON.parse(localStorage.getItem(`builderai_prefs_${uid}`)) || null; } catch { return null; }
  });
  const [onboardingComplete, setOnboardingCompleteState] = useState(() => {
    const uid = getUserId();
    if (uid) return !!localStorage.getItem(`builderai_onboarded_${uid}`);
    return !!localStorage.getItem('builderai_onboarded');
  });

  const accessTokenRef = useRef(null);
  // State mirror of the access token so consumers that need to re-render on token
  // change (e.g. SocketProvider) can subscribe to it. Keep both in lockstep.
  const [accessToken, setAccessTokenState] = useState(null);
  const isAuthenticated = !!user;
  const role = user?.role || 'builder';

  function _setToken(t) {
    accessTokenRef.current = t;
    setAccessTokenState(t);
  }

  // Single in-flight refresh promise, shared by all concurrent callers so N
  // parallel 401s trigger exactly one token refresh (not N).
  const refreshInFlightRef = useRef(null);

  // Exchange the stored refresh token for a fresh access token. Updates both the
  // ref (for reads) and the state mirror (so SocketProvider's [token] effect
  // re-runs and the socket reconnects with the new token). De-dupes concurrent
  // callers via refreshInFlightRef. Returns the new access token, or null if no
  // refresh token is stored; throws if the exchange fails.
  const refreshAccessToken = useCallback(async () => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;
    const rt = localStorage.getItem('builderai_rt');
    if (!rt) return null;
    const p = (async () => {
      const r = await fetch(`${API}/api/v1/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refresh_token: rt }),
      });
      if (!r.ok) throw new Error('Session expired');
      const json = await r.json();
      if (!json.success) throw new Error('Session expired');
      _setToken(json.data.tokens.access_token);
      localStorage.setItem('builderai_rt', json.data.tokens.refresh_token);
      return json.data.tokens.access_token;
    })();
    refreshInFlightRef.current = p;
    try { return await p; }
    finally { refreshInFlightRef.current = null; }
  }, []);

  // GET /users/me with the current Bearer token; replace user state + snapshot.
  const refreshUser = useCallback(async () => {
    const at = accessTokenRef.current;
    if (!at) return null;
    const res = await fetch(`${API}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${at}` },
    });
    if (!res.ok) throw new Error('Failed to refresh user');
    const json = await res.json();
    const u = json.data?.user || json.data;
    if (!u) return u;
    // ponytail: role switching is client-only — there is no server role endpoint
    // yet (see PRODUCTION_AUTH_HARDENING.md, server-side persistence deferred).
    // Re-apply any local role override (set by switchRole/setOnboardingRole) so a
    // mount refresh or a socket-driven refreshUser() doesn't clobber the switched
    // role back to the server's stored role.
    // Whitelisted: localStorage is user-writable, so an unchecked override would let
    // anyone render the /admin shell (server still 403s, but don't even show it).
    const override = u.id ? localStorage.getItem(`builderai_role_${u.id}`) : null;
    const merged = (override === 'builder' || override === 'investor') ? { ...u, role: override } : u;
    setUser(merged);
    localStorage.setItem('builderai_u', JSON.stringify(merged));
    return merged;
  }, []);

  // On mount: attempt to restore session from stored refresh token
  useEffect(() => {
    const rt = localStorage.getItem('builderai_rt');
    if (!rt) { setIsLoading(false); return; }

    refreshAccessToken()
      .then(async (at) => {
        if (!at) throw new Error('Session expired');
        const stored = localStorage.getItem('builderai_u');
        if (stored) {
          const u = JSON.parse(stored);
          setUser(u);
          _restoreUserState(u);
        }
        // Replace the stored snapshot with fresh server data; keep the
        // localStorage fallback (already applied above) if the fetch fails.
        try { await refreshUser(); } catch {}
      })
      .catch(() => {
        localStorage.removeItem('builderai_rt');
        localStorage.removeItem('builderai_u');
      })
      .finally(() => setIsLoading(false));
    // refreshAccessToken/refreshUser are stable (useCallback); run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function _restoreUserState(u) {
    const uid = u?.id;
    if (!uid) return;
    // E-Infra is a pre-provisioned builder — never gate it behind onboarding.
    const forced = isEinfraBuilder(u);
    if (forced) localStorage.setItem(`builderai_onboarded_${uid}`, 'true');
    const wasOnboarded = forced || !!localStorage.getItem(`builderai_onboarded_${uid}`);
    setOnboardingCompleteState(wasOnboarded);
    try {
      const prefs = localStorage.getItem(`builderai_prefs_${uid}`);
      if (prefs) setPreferences(JSON.parse(prefs));
    } catch {}
  }

  async function login(email, password) {
    let res;
    try {
      res = await fetch(`${API}/api/v1/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    let json;
    try { json = await res.json(); } catch {
      throw new Error('Server returned an unexpected response. Please try again.');
    }
    if (!res.ok) throw new Error(json.error?.message || 'Invalid email or password.');
    _applySession(json.data);
    return json.data.user;
  }

  async function register(userData) {
    let res;
    try {
      res = await fetch(`${API}/api/v1/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(userData),
      });
    } catch {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    let json;
    try { json = await res.json(); } catch {
      throw new Error('Server returned an unexpected response. Please try again.');
    }
    if (!res.ok) throw new Error(json.error?.message || 'Registration failed.');
    _applySession(json.data);
    return json.data.user;
  }

  const logout = useCallback(async () => {
    const rt = localStorage.getItem('builderai_rt');
    const at = accessTokenRef.current;
    try {
      await fetch(`${API}/api/v1/auth/logout`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(at ? { Authorization: `Bearer ${at}` } : {}),
        },
        body: JSON.stringify({ refresh_token: rt }),
      });
    } catch {}
    invalidate();      // drop the module-global GET cache so no response leaks to the next user
    _clearSession();
  }, []);

  // Shared authed fetch: attaches the current Bearer token and, on a 401, does a
  // single token refresh + one retry. If the retry also 401s (refresh dead), the
  // user is logged out. The one place that adds auth + mid-session recovery to a
  // request — useAuthedApi and the admin mutation call sites route through it.
  const authedFetch = useCallback(async (path, options = {}, fallbackError) => {
    const withAuth = (tok) => ({
      ...options,
      headers: { ...(options.headers || {}), ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
    });
    try {
      return await apiFetch(path, withAuth(accessTokenRef.current), fallbackError);
    } catch (err) {
      if (err.status !== 401) throw err;
      let fresh = null;
      try { fresh = await refreshAccessToken(); } catch {}
      if (!fresh) { logout(); throw err; }
      try {
        return await apiFetch(path, withAuth(fresh), fallbackError);
      } catch (err2) {
        if (err2.status === 401) logout();
        throw err2;
      }
    }
  }, [refreshAccessToken, logout]);

  async function deleteAccount(email, password) {
    const at = accessTokenRef.current;
    let res;
    try {
      res = await fetch(`${API}/api/v1/users/me`, {
        method:  'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(at ? { Authorization: `Bearer ${at}` } : {}),
        },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    if (!res.ok) {
      let msg = 'Failed to delete account.';
      try { const j = await res.json(); msg = j.error?.message || msg; } catch {}
      throw new Error(msg);
    }
    // Purge this user's local artifacts (kept by _clearSession) before signing out.
    if (user?.id) {
      localStorage.removeItem(`builderai_onboarded_${user.id}`);
      localStorage.removeItem(`builderai_prefs_${user.id}`);
      localStorage.removeItem(`builderai_role_${user.id}`);
    }
    invalidate();
    _clearSession();
  }

  function setOnboardingRole(selectedRole) {
    if (user) {
      const updated = { ...user, role: selectedRole };
      setUser(updated);
      localStorage.setItem('builderai_u', JSON.stringify(updated));
      // Persist the client-side role choice so refreshUser() re-applies it (see
      // the ponytail note there — role switching is client-only for now).
      if (user.id) localStorage.setItem(`builderai_role_${user.id}`, selectedRole);
    }
  }

  function completeOnboarding() {
    if (user?.id) localStorage.setItem(`builderai_onboarded_${user.id}`, 'true');
    localStorage.setItem('builderai_onboarded', 'true');
    setOnboardingCompleteState(true);
  }

  function savePreferences(prefs) {
    if (user?.id) {
      localStorage.setItem(`builderai_prefs_${user.id}`, JSON.stringify(prefs));
      setPreferences(prefs);
    }
  }

  function updatePreference(key, value) {
    const merged = { ...(preferences || {}), [key]: value };
    savePreferences(merged);
  }

  function switchRole(newRole) {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('builderai_u', JSON.stringify(updated));
    // Persist the client-side role override so refreshUser() (on reload / socket
    // events) re-applies it instead of snapping back to the server's role.
    if (user.id) localStorage.setItem(`builderai_role_${user.id}`, newRole);
    // Clear old preferences so the retake flow collects fresh ones for the new
    // role. onboardingComplete stays true on purpose: the caller routes to the
    // /onboarding/retake questions directly (role already set, no role picker),
    // and keeping it true means dashboards never fall back to the role picker.
    setPreferences(null);
    if (user?.id) localStorage.removeItem(`builderai_prefs_${user.id}`);
  }

  function _applySession({ user: u, tokens }) {
    _setToken(tokens.access_token);
    localStorage.setItem('builderai_rt', tokens.refresh_token);
    localStorage.setItem('builderai_u', JSON.stringify(u));
    setUser(u);
    _restoreUserState(u);
  }

  function _clearSession() {
    _setToken(null);
    localStorage.removeItem('builderai_rt');
    localStorage.removeItem('builderai_u');
    localStorage.removeItem('builderai_onboarded');
    // Per-user flags (builderai_onboarded_<id> and builderai_prefs_<id>) are intentionally kept
    setUser(null);
    setOnboardingCompleteState(false);
    setPreferences(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated,
      isLoading,
      onboardingComplete,
      preferences,
      accessToken,
      refreshUser,
      refreshAccessToken,
      authedFetch,
      login,
      register,
      logout,
      setOnboardingRole,
      completeOnboarding,
      savePreferences,
      getAccessToken: () => accessTokenRef.current,
      updatePreference,
      switchRole,
      deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
