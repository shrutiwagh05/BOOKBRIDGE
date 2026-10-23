import axios from 'axios';

// Base API instance configured with default headers and base URL.
// A timeout prevents auth forms from spinning forever if the API is asleep or unreachable.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers && typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    const token = localStorage.getItem('bookbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error responses cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      message = 'The server is taking too long to respond. Please try again in a moment.';
    } else if (!error.response && error.request) {
      message = 'Could not reach the BookBridge server. Please check your connection and try again.';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
