/*
 * AuthContext.jsx — Global authentication and session context.
 *
 * Provides user state, JWT access/refresh token management, and onboarding
 * completion tracking to the entire application via React Context. Exposes
 * login, register, logout, setOnboardingRole, completeOnboarding, and
 * savePreferences actions. Session is persisted to localStorage; on mount
 * the refresh token is exchanged for a new access token to restore the
 * session. Also exports the useAuth() convenience hook.
 */
import { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  const isAuthenticated = !!user;
  const role = user?.role || 'builder';

  // On mount: attempt to restore session from stored refresh token
  useEffect(() => {
    const rt = localStorage.getItem('builderai_rt');
    if (!rt) { setIsLoading(false); return; }

    fetch('/api/v1/auth/refresh', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh_token: rt }),
    })
      .then(r => r.json())
      .then(json => {
        if (!json.success) throw new Error('Session expired');
        accessTokenRef.current = json.data.tokens.access_token;
        localStorage.setItem('builderai_rt', json.data.tokens.refresh_token);
        const stored = localStorage.getItem('builderai_u');
        if (stored) {
          const u = JSON.parse(stored);
          setUser(u);
          _restoreUserState(u.id);
        }
      })
      .catch(() => {
        localStorage.removeItem('builderai_rt');
        localStorage.removeItem('builderai_u');
      })
      .finally(() => setIsLoading(false));
  }, []);

  function _restoreUserState(uid) {
    if (!uid) return;
    const wasOnboarded = !!localStorage.getItem(`builderai_onboarded_${uid}`);
    setOnboardingCompleteState(wasOnboarded);
    try {
      const prefs = localStorage.getItem(`builderai_prefs_${uid}`);
      if (prefs) setPreferences(JSON.parse(prefs));
    } catch {}
  }

  async function login(email, password) {
    const res  = await fetch('/api/v1/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Invalid email or password.');
    _applySession(json.data);
    return json.data.user;
  }

  async function register(userData) {
    const res  = await fetch('/api/v1/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(userData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Registration failed.');
    _applySession(json.data);
    return json.data.user;
  }

  async function logout() {
    const rt = localStorage.getItem('builderai_rt');
    const at = accessTokenRef.current;
    try {
      await fetch('/api/v1/auth/logout', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(at ? { Authorization: `Bearer ${at}` } : {}),
        },
        body: JSON.stringify({ refresh_token: rt }),
      });
    } catch {}
    _clearSession();
  }

  function setOnboardingRole(selectedRole) {
    if (user) {
      const updated = { ...user, role: selectedRole };
      setUser(updated);
      localStorage.setItem('builderai_u', JSON.stringify(updated));
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

  function _applySession({ user: u, tokens }) {
    accessTokenRef.current = tokens.access_token;
    localStorage.setItem('builderai_rt', tokens.refresh_token);
    localStorage.setItem('builderai_u', JSON.stringify(u));
    setUser(u);
    _restoreUserState(u.id);
  }

  function _clearSession() {
    accessTokenRef.current = null;
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
      login,
      register,
      logout,
      setOnboardingRole,
      completeOnboarding,
      savePreferences,
      getAccessToken: () => accessTokenRef.current,
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
