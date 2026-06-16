import api from './api';

export const eventService = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  register: (id, data) => api.post(`/events/${id}/register`, data),
  cancelRegistration: (id) => api.delete(`/events/${id}/register`),
  markAttendance: (id, data) => api.patch(`/events/${id}/attendance`, data),
  getRegistrations: (id) => api.get(`/events/${id}/registrations`),
};
