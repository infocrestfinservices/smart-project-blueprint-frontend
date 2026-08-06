import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
      const sessionUser = { id: me.id, email: me.email, full_name: me.full_name, plan: me.plan };
      persistSession(null, sessionUser);
      setUser(sessionUser);
    } catch {
      clearSession();
      setUser(null);
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (hasToken) checkUserAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Authenticate with email + password. Throws an Error (with a readable
  // message) on failure so callers can surface it.
  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    const sessionUser = { id: data.user_id, email: data.email, full_name: data.full_name };
    persistSession(data.access_token, sessionUser);
    setUser(sessionUser);
    setAuthChecked(true);
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
