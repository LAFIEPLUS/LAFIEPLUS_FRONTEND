import api from './axios.js';

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/api/auth/reset-password/${token}`, data),
};

export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.patch('/api/user/profile', data),
  uploadAvatar: (formData) => api.post('/api/avatar', formData, {
    headers: { 'Content-Type': undefined },
  }),
  deleteAvatar: () => api.delete('/api/avatar'),
  getAllUsers: (params) => api.get('/api/user/profiles', { params }),
  getUserById: (id) => api.get(`/api/user/${id}`),
  updateUserRole: (id, role) => api.put(`/api/user/${id}/role`, { role }),
  updateUserStatus: (id, isActive) => api.put(`/api/user/${id}/status`, { isActive }),
  notifyUser: (id, data) => api.post(`/api/${id}/notify`, data),
  deleteUser: (id) => api.delete(`/api/${id}`),
};

export const symptomAPI = {
  check: (symptoms) => api.post('/api/symptoms/check', { symptoms }),
  getHistory: (params) => api.get('/api/symptoms/history', { params }),
  getSession: (id) => api.get(`/api/symptoms/history/${id}`),
  getRiskLevels: () => api.get('/api/risk-levels'),
};

export const libraryAPI = {
  getArticles: (params) => api.get('/api/library/articles', { params }),
  getArticle: (id) => api.get(`/api/library/articles/${id}`),
  getCategories: () => api.get('/api/library/categories'),
  createArticle: (data) => api.post('/api/library/article', data),
  updateArticle: (id, data) => api.put(`/api/library/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/api/library/article/${id}`),
};

export const consultationAPI = {
  create: (data) => api.post('/api/consultation', data),
  getAll: (params) => api.get('/api/consultations', { params }),
  getOne: (id) => api.get(`/api/consultation/${id}`),
  accept: (id) => api.patch(`/api/consultation/${id}/accept`),
  sendMessage: (id, content) => api.post(`/api/consultation/${id}/messages`, { content }),
  getMessages: (id) => api.get(`/api/consultation/${id}/messages`),
  close: (id, data) => api.patch(`/api/consultation/${id}/close`, data),
  cancel: (id) => api.patch(`/api/consultation/${id}/cancel`),
};

export const facilityAPI = {
  getNearby: (params) => api.get('/api/facility/nearby', { params }),
  suggest: (params) => api.get('/api/facility/suggest', { params }),
  getOne: (id) => api.get(`/api/facility/${id}`),
  create: (data) => api.post('/api/facility', data),
  update: (id, data) => api.put(`/api/facility/${id}`, data),
};

export const referralAPI = {
  create: (data) => api.post('/api/referral', data),
  getAll: (params) => api.get('/api/referrals', { params }),
  getOne: (id) => api.get(`/api/referral/${id}`),
  updateStatus: (id, data) => api.patch(`/api/referral/${id}/status`, data),
};

export const partnerAPI = {
  getAvailable: (params) => api.get('/api/partner/available', { params }),
  getStats: () => api.get('/api/partner/stats'),
  toggleAvailability: (isAvailable) => api.patch('/api/partner/availability', { isAvailable }),
  updateProfile: (data) => api.patch('/api/partner/profile', data),
};