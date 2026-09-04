import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { authService } from '@/api/authService';

const AuthContext = createContext();

const USER_KEY = 'rc_auth_user';
const TOKEN_KEY = 'rc_auth_token';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const persistSession = (token, user) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore storage errors */
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore storage errors */
  }
};

export const AuthProvider = ({ children }) => {
  const hasToken = !!getAuthToken();
  const [user, setUser] = useState(readStoredUser);
  // Only block the app on startup when there is a token to validate.
  const [isLoadingAuth, setIsLoadingAuth] = useState(hasToken);
  const [authChecked, setAuthChecked] = useState(!hasToken);
  // Whatever the account has saved (see Profile > Settings), applied on top of whatever
  // next-themes already restored from localStorage for this browser — this is what makes
  // the preference follow the account across devices instead of staying per-browser.
  const { setTheme } = useTheme();

  const isAuthenticated = !!user;

  // Validate the stored token against the backend. Used on mount and by
  // ProtectedRoute; clears the session if the token is missing or invalid.
  const checkUserAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      clearSession();
      setUser(null);
      setAuthChecked(true);
      setIsLoadingAuth(false);
      return;
    }
    setIsLoadingAuth(true);
    try {
      const me = await authService.me(token);
      // is_admin decides whether the Admin link exists at all. The BACKEND decides whether
      // the routes answer — this flag only saves showing a door that would 404.
      const sessionUser = { id: me.id, email: me.email, full_name: me.full_name,
                            plan: me.plan, is_admin: Boolean(me.is_admin),
                            avatar_url: me.avatar_url };
      persistSession(null, sessionUser);
      setUser(sessionUser);
      if (me.theme_preference) setTheme(me.theme_preference);
    } catch {
      clearSession();
      setUser(null);
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  }, [setTheme]);

  useEffect(() => {
    if (hasToken) checkUserAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Authenticate with email + password. Throws an Error (with a readable
  // message) on failure so callers can surface it.
  //
  // When the account has 2FA on, the backend answers with a challenge instead of a token
  // (see routers/auth_router.py) — this returns that shape ({ requires_2fa, challenge_token })
  // unchanged rather than treating it as a session, so the caller (Login.jsx) can prompt for
  // the code. No token is stored and the user stays logged out until completeTwoFactorLogin.
  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.requires_2fa) return data;
    const sessionUser = { id: data.user_id, email: data.email, full_name: data.full_name };
    persistSession(data.access_token, sessionUser);
    setUser(sessionUser);
    setAuthChecked(true);
    checkUserAuth(); // fills in plan/avatar/theme in the background; the fields above are enough to route past ProtectedRoute immediately
    return sessionUser;
  };

  // Second half of a 2FA login: exchanges the challenge_token + a TOTP or backup code for
  // a real session, the same way `login` does for a password.
  const completeTwoFactorLogin = async (challengeToken, code) => {
    const data = await authService.verifyTwoFactorLogin(challengeToken, code);
    const sessionUser = { id: data.user_id, email: data.email, full_name: data.full_name };
    persistSession(data.access_token, sessionUser);
    setUser(sessionUser);
    setAuthChecked(true);
    checkUserAuth();
    return sessionUser;
  };

  // Create a new account. Does not log in automatically; requires email verification.
  const register = async (email, password, fullName) => {
    const data = await authService.register({ email, password, full_name: fullName });
    return data;
  };

  const logout = (redirect = '/login') => {
    clearSession();
    setUser(null);
    if (redirect) {
      window.location.href = typeof redirect === 'string' ? redirect : '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const checkAppState = async () => {
    // No public app settings to load for now.
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: {},
      authChecked,
      login,
      completeTwoFactorLogin,
      register,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
