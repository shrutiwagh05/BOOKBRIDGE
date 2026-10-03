import api from './api';

export const adminService = {
  // Get administrative dashboard statistics
  getStats: async () => {
    return await api.get('/admin/stats');
  },

  // Get notifications
  getNotifications: async () => {
    return await api.get('/notifications');
  },

  // Mark notification as read
  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  },
};

export default adminService;
