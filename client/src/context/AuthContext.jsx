import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bookbridge_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Re-verify token on mount or token change
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('bookbridge_token');
      if (storedToken) {
        try {
          const response = await authService.getMe();
          setUser(response.data);
        } catch (error) {
          console.warn('[AuthContext] Stored session invalid, clearing token');
          localStorage.removeItem('bookbridge_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login({ email, password });
      const { token: receivedToken, ...userData } = response.data;

      localStorage.setItem('bookbridge_token', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      setIsLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      setIsLoading(false);
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Register handler
  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.register(userData);
      const { token: receivedToken, ...createdUser } = response.data;

      localStorage.setItem('bookbridge_token', receivedToken);
      setToken(receivedToken);
      setUser(createdUser);
      setIsLoading(false);
      return { success: true, user: createdUser };
    } catch (error) {
      setIsLoading(false);
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('bookbridge_token');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        authError,
        login,
        register,
        logout,
        setUser,
      }}
    >
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

export default AuthContext;
