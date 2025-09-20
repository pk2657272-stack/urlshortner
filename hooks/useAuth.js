'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { setAuthToken, getAuthToken, removeAuthToken } from '@/utils/auth';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create API instance specifically for auth
const createAuthAPI = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const authAPI = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
  });

  return authAPI;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const authAPI = createAuthAPI();
          const response = await authAPI.get('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth initialization error:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const authAPI = createAuthAPI();
      const response = await authAPI.post('/api/auth/login', { 
        email: email.trim(), 
        password 
      });
      const { token, user } = response.data;
      
      setAuthToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const register = async (email, password) => {
    try {
      const authAPI = createAuthAPI();
      const response = await authAPI.post('/api/auth/register', { 
        email: email.trim(), 
        password 
      });
      const { token, user } = response.data;
      
      setAuthToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};