import { createContext, useContext, useMemo, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('municipal_token');
    const rawUser = localStorage.getItem('municipal_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [{ token, user }, setAuthState] = useState(getStoredAuth);

  const setAuth = (authData) => {
    localStorage.setItem('municipal_token', authData.token);
    localStorage.setItem('municipal_user', JSON.stringify(authData.user));
    setAuthState({ token: authData.token, user: authData.user });
  };

  const clearAuth = () => {
    localStorage.removeItem('municipal_token');
    localStorage.removeItem('municipal_user');
    setAuthState({ token: null, user: null });
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setAuth(data);
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    setAuth(data);
    return data;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout: clearAuth
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
