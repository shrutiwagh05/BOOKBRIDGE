import axios from 'axios';

// Resolve normalized API baseURL:
// 1. If VITE_API_URL is provided (e.g. 'https://backend.onrender.com' or 'https://backend.vercel.app/api'),
//    ensure it ends with '/api' and strip any trailing slashes.
// 2. In local dev with Vite proxy or relative proxy, default to '/api'.
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return '/api';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

// Base API instance configured with default headers and base URL.
// A timeout prevents auth forms from spinning forever if the API is asleep or unreachable.
const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT bearer token from localStorage & support FormData
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
    let message = error.response?.data?.message;
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      message = 'The server is taking too long to respond. Please try again in a moment.';
    } else if (!error.response && error.request) {
      message = 'Could not reach the BookBridge server. Please check your connection and try again.';
    } else if (!message) {
      if (error.response?.status === 404) {
        message = 'The requested resource or API endpoint was not found (404). Please check the backend URL configuration.';
      } else if (error.response?.status === 500) {
        message = 'Server encountered an internal error. Please try again later.';
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to backend server. Please ensure the backend is running and CORS is allowed.';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
