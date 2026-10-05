import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to outgoing requests if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medifind_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const medicineApi = {
  search: async (query = '') => {
    const response = await api.get('/medicines', { params: { q: query } });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  },
  getAvailability: async (id, lat, lng) => {
    const response = await api.get(`/medicines/${id}/availability`, { params: { lat, lng } });
    return response.data;
  }
};

export const pharmacyApi = {
  getAll: async (lat, lng) => {
    const response = await api.get('/pharmacies', { params: { lat, lng } });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/pharmacies/${id}`);
    return response.data;
  }
};

export const inventoryApi = {
  getAll: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },
  update: async (id, payload) => {
    const response = await api.put(`/admin/inventory/${id}`, payload);
    return response.data;
  }
};

export const reservationApi = {
  create: async (payload) => {
    const response = await api.post('/reservations', payload);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/reservations');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/reservations/${id}/status`, { status });
    return response.data;
  }
};

export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};

export default api;
