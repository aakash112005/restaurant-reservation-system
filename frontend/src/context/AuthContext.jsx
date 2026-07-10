import React, { createContext, useContext, useEffect, useState } from 'react';
import client, { getErrorMessage } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('nt_user');
    const token = localStorage.getItem('nt_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistSession = (token, userData) => {
    localStorage.setItem('nt_token', token);
    localStorage.setItem('nt_user', JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async ({ name, email, password, phone }) => {
    try {
      const { data } = await client.post('/auth/signup', { name, email, password, phone });
      persistSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const { data } = await client.post('/auth/login', { email, password });
      persistSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const adminLogin = async ({ email, password }) => {
    try {
      const { data } = await client.post('/auth/admin/login', { email, password });
      persistSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const logout = () => {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
