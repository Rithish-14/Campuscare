import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('campus_care_token');
      const storedUser = localStorage.getItem('campus_care_user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify current user details with backend
          const res = await api.get('/auth/profile');
          setUser(res.data);
          localStorage.setItem('campus_care_user', JSON.stringify(res.data));
        } catch (error) {
          console.error('Failed to restore auth session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, ...userData } = res.data;
      
      localStorage.setItem('campus_care_token', token);
      localStorage.setItem('campus_care_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, department) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role, department });
      const { token, ...userData } = res.data;
      
      localStorage.setItem('campus_care_token', token);
      localStorage.setItem('campus_care_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('campus_care_token');
    localStorage.removeItem('campus_care_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
