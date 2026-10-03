import api from './api';

export const exchangeService = {
  // Get active user exchanges and borrow transactions
  getMyExchanges: async () => {
    return await api.get('/exchanges');
  },

  // Create a new borrow or exchange request
  createRequest: async (requestData) => {
    return await api.post('/exchanges', requestData);
  },
};

export default exchangeService;
