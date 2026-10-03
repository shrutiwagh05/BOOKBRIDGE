import api from './api';

export const exchangeService = {
  // Get all user exchanges (both incoming and outgoing)
  getMyExchanges: async () => {
    return await api.get('/exchanges');
  },

  // Get incoming requests (where user is the book owner/lender)
  getIncomingRequests: async () => {
    return await api.get('/exchanges/incoming');
  },

  // Get outgoing requests (where user requested from another owner)
  getOutgoingRequests: async () => {
    return await api.get('/exchanges/outgoing');
  },

  // Submit a new borrow or exchange request
  createRequest: async (requestData) => {
    return await api.post('/exchanges', requestData);
  },

  // Accept an incoming request (Owner only)
  acceptRequest: async (id) => {
    return await api.patch(`/exchanges/${id}/accept`);
  },

  // Reject an incoming request (Owner only)
  rejectRequest: async (id, reason = '') => {
    return await api.patch(`/exchanges/${id}/reject`, { reason });
  },

  // Cancel an outgoing request (Requester only)
  cancelRequest: async (id) => {
    return await api.patch(`/exchanges/${id}/cancel`);
  },

  // Mark an active borrowed book as returned (Owner or Borrower)
  returnRequest: async (id) => {
    return await api.patch(`/exchanges/${id}/return`);
  },
};

export default exchangeService;
