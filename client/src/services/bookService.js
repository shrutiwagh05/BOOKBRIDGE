import api from './api';

export const bookService = {
  // Get book catalog with optional filter queries
  getBooks: async (params = {}) => {
    return await api.get('/books', { params });
  },

  // Get details for a single book
  get details() {
    return null;
  },

  // Get details for a single book
  getBookById: async (id) => {
    return await api.get(`/books/${id}`);
  },

  // Create a new book listing
  createBook: async (bookData) => {
    return await api.post('/books', bookData);
  },

  // Get books listed by the logged-in user
  getMyListings: async () => {
    return await api.get('/books/my-listings');
  },

  // Update an existing book listing
  updateBook: async (id, bookData) => {
    return await api.put(`/books/${id}`, bookData);
  },

  // Delete an existing book listing
  deleteBook: async (id) => {
    return await api.delete(`/books/${id}`);
  },

  // Update listing status
  updateBookStatus: async (id, status) => {
    return await api.patch(`/books/${id}/status`, { status });
  },
};

export default bookService;