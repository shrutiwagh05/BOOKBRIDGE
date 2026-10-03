import api from './api';

export const bookService = {
  // Get book catalog with optional filter queries
  getBooks: async (params = {}) => {
    return await api.get('/books', { params });
  },

  // Get details for a single book
  getBookById: async (id) => {
    return await api.get(`/books/${id}`);
  },

  // Create a new book listing
  createBook: async (bookData) => {
    return await api.post('/books', bookData);
  },
};

export default bookService;
