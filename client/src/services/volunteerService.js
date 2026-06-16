import api from './api';

export const volunteerService = {
  getAll: (params) => api.get('/volunteers', { params }),
  getById: (id) => api.get(`/volunteers/${id}`),
  update: (id, formData) => api.put(`/volunteers/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateJson: (id, data) => api.put(`/volunteers/${id}`, data),
  toggleStatus: (id) => api.patch(`/volunteers/${id}/status`),
  deactivate: (id) => api.delete(`/volunteers/${id}`),
  getEvents: (id) => api.get(`/volunteers/${id}/events`),
  changePassword: (id, data) => api.put(`/volunteers/${id}/password`, data),
  getLeaderboard: () => api.get('/volunteers/leaderboard/top'),
};
