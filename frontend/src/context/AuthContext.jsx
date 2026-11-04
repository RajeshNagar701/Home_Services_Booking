import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('homeserve_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user profile on app load if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem('homeserve_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success && res.data) {
          setUser(res.data.user);
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        localStorage.removeItem('homeserve_token');
        setUser(null);
        setProfile(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        localStorage.setItem('homeserve_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success && res.data) {
        localStorage.setItem('homeserve_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('homeserve_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfileState = (updatedUser, updatedProfile) => {
    if (updatedUser) setUser((prev) => ({ ...prev, ...updatedUser }));
    if (updatedProfile) setProfile((prev) => ({ ...prev, ...updatedProfile }));
  };

  const value = {
    user,
    profile,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    role: user ? user.role : null,
    isAdmin: user?.role === 'admin',
    isProvider: user?.role === 'provider',
    isTechnician: user?.role === 'technician',
    isCustomer: user?.role === 'customer',
    login,
    register,
    logout,
    updateProfileState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
