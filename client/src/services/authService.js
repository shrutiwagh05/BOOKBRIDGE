import api from './api';

export const authService = {
  // Register a new user
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // Login existing user
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  // Get current logged-in user profile
  getMe: async () => {
    return await api.get('/auth/me');
  },
};

export default authService;
