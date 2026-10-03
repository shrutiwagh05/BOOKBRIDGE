import api from './api';

export const userService = {
  // Get user profile details and user listings
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Update user profile info
  updateProfile: async (userData) => {
    return await api.put('/users/profile', userData);
  },
};

export default userService;
