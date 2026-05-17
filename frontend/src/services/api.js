import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (data) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Customers API
export const customerAPI = {
  getAll: (limit = 20, offset = 0, search = '') =>
    api.get('/customers', {
      params: { limit, offset, search },
    }),

  getById: (id) =>
    api.get(`/customers/${id}`),

  create: (data) =>
    api.post('/customers', data),

  update: (id, data) =>
    api.put(`/customers/${id}`, data),
};

// Orders API
export const orderAPI = {
  getAll: (limit = 20, offset = 0, status = '', customerId = '') =>
    api.get('/orders', {
      params: { limit, offset, status, customerId },
    }),

  getById: (id) =>
    api.get(`/orders/${id}`),

  create: (data) =>
    api.post('/orders', data),

  updateStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }),
};

export default api;
