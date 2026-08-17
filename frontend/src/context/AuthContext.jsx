import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'aegis_auth_token';
const ROLE_KEY = 'aegis_auth_role';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore authenticated session on initial mount
  useEffect(() => {
    let isMounted = true;
    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const meData = await authApi.getMe(storedToken);
        if (isMounted && meData && meData.user_id) {
          setUser({
            id: meData.user_id,
            email: meData.email,
            role: meData.role,
            is_active: meData.is_active
          });
          setRole(meData.role);
          setProfile(meData.role === 'RESEARCHER' ? meData.researcher : meData.patient);
          setToken(storedToken);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn('Session restoration failed:', err);
        logout();
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    restoreSession();
    return () => { isMounted = false; };
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await authApi.login({ email, password });
      if (!data || !data.access_token) {
        throw new Error('Authentication failed: Invalid credentials');
      }

      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(ROLE_KEY, data.role);

      setToken(data.access_token);
      setUser({
        id: data.user_id,
        email: data.email,
        role: data.role,
        name: data.name
      });
      setRole(data.role);
      setProfile(data.role === 'RESEARCHER' ? data.researcher : data.patient);

      return { success: true, role: data.role, data };
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your email and password.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (registerData) => {
    setAuthError(null);
    try {
      const data = await authApi.register(registerData);
      if (!data || !data.access_token) {
        throw new Error('Registration failed. Please try again.');
      }

      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(ROLE_KEY, data.role);

      setToken(data.access_token);
      setUser({
        id: data.user_id,
        email: data.email,
        role: data.role,
        name: data.name
      });
      setRole(data.role);
      setProfile(data.role === 'RESEARCHER' ? data.researcher : data.patient);

      return { success: true, role: data.role, data };
    } catch (err) {
      const msg = err.message || 'Registration failed. Please verify your details.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setToken(null);
    setUser(null);
    setRole(null);
    setProfile(null);
    setAuthError(null);
  }, []);

  const value = {
    token,
    user,
    role,
    profile,
    isAuthenticated: !!token && !!user,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
