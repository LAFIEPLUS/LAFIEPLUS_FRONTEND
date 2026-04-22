import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lafieplus_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('lafieplus_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount — only clears on explicit 401, not network errors
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await authAPI.getMe();
        const freshUser = res.data.data.user;
        setUser(freshUser);
        localStorage.setItem('lafieplus_user', JSON.stringify(freshUser));
      } catch (err) {
        // Only clear session on 401 — keep it on network errors
        if (err.response?.status === 401) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('lafieplus_token');
          localStorage.removeItem('lafieplus_user');
        }
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []); // eslint-disable-line

  const login = useCallback((tokenVal, userData) => {
    // Write to localStorage FIRST so the interceptor picks it up immediately
    localStorage.setItem('lafieplus_token', tokenVal);
    localStorage.setItem('lafieplus_user', JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    // Clear local state first so no more auth requests fire
    setToken(null);
    setUser(null);
    localStorage.removeItem('lafieplus_token');
    localStorage.removeItem('lafieplus_user');
    // Then attempt server-side logout (fire-and-forget)
    try { await authAPI.logout(); } catch { /* ignore */ }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('lafieplus_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};