import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import * as api from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Load user on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const userData = await api.getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        // Don't set error if it's just an unauthorized error (not logged in)
        if (err?.status !== 401) {
          setError('Failed to load user');
          console.error('Error loading user:', err);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only try to load user if we have a token
    if (typeof window !== 'undefined' && localStorage.getItem('medusa_token')) {
      loadUser();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password, redirectPath = '/account') => {
    try {
      setIsLoading(true);
      const response = await api.loginUser(email, password);
      setUser(response.customer);
      setError(null);
      
      // Redirect after successful login
      router.push(redirectPath);
      
      return response.customer;
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Register a new user
  const register = useCallback(async (userData, redirectPath = '/account') => {
    try {
      setIsLoading(true);
      const response = await api.registerUser(userData);
      
      // Auto login after registration
      if (userData.email && userData.password) {
        await login(userData.email, userData.password, redirectPath);
      }
      
      setError(null);
      return response;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err?.message || 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  // Logout user
  const logout = useCallback(() => {
    api.logoutUser();
    setUser(null);
    router.push('/');
  }, [router]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};