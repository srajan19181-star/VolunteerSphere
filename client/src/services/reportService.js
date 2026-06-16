import api from './api';

export const reportService = {
  getSummary: () => api.get('/reports/summary'),
  getMonthly: () => api.get('/reports/monthly'),
  getActivity: () => api.get('/reports/activity'),
  exportVolunteers: (params) => api.get('/reports/volunteers', { params, responseType: params.format !== 'json' ? 'blob' : 'json' }),
  exportEvents: (params) => api.get('/reports/events', { params, responseType: params.format !== 'json' ? 'blob' : 'json' }),
  exportHours: (params) => api.get('/reports/hours', { params, responseType: params.format !== 'json' ? 'blob' : 'json' }),
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};
