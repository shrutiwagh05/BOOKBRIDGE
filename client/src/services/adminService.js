import api from './api';

export const adminService = {
  // Get administrative dashboard statistics
  getStats: async () => {
    return await api.get('/admin/stats');
  },
  // Get users for admin management
getUsers: async (params = {}) => {
  return await api.get('/admin/users', { params });
},
  // Update user active/inactive status
  updateUserStatus: async (userId, isActive) => {
    return await api.patch(`/admin/users/${userId}/status`, {
      isActive,
    });
  },
    // Get books for admin management
  getBooks: async (params = {}) => {
    return await api.get('/admin/books', { params });
  },

  // Remove a book listing
  deleteBook: async (bookId) => {
    return await api.delete(`/admin/books/${bookId}`);
  },
// Get requests and transactions for admin monitoring
getRequests: async (params = {}) => {
  return await api.get('/admin/requests', { params });
},

  // Get notifications
  getNotifications: async () => {
    return await api.get('/notifications');
  },

  // Mark notification as read
  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  },
    // Send an admin notification to a specific user
  sendNotification: async (userId, data) => {
    return await api.post(`/admin/users/${userId}/notifications`, data);
  },
};

export default adminService;
