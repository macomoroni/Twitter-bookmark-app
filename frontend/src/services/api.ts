import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Bookmarks API
export const bookmarksApi = {
  getAll: (params?: any) => api.get('/bookmarks', { params }),
  getOne: (id: string) => api.get(`/bookmarks/${id}`),
  create: (data: any) => api.post('/bookmarks', data),
  update: (id: string, data: any) => api.patch(`/bookmarks/${id}`, data),
  delete: (id: string) => api.delete(`/bookmarks/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: { name: string; color?: string; icon?: string }) =>
    api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Tags API
export const tagsApi = {
  getAll: () => api.get('/tags'),
  create: (data: { name: string }) => api.post('/tags', data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

// Search API
export const searchApi = {
  search: (params: any) => api.get('/search', { params }),
  getStats: () => api.get('/search/stats'),
};
