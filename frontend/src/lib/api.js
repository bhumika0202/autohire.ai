const BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('careerpilot_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = { ...options, headers };
  if (config.body && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  } else if (config.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
};

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  getMe: () => request('/auth/me'),

  // Profile & Avatar
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: data }),
  uploadAvatar: (formData) => request('/profile/avatar', { method: 'POST', body: formData }),
  getStats: () => request('/profile/stats'),

  // Resume
  uploadResume: (formData) => request('/resume/upload', { method: 'POST', body: formData }),
  getResumeStatus: () => request('/resume/status'),

  // Jobs
  getJobs: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v)).toString();
    return request(`/jobs${qs ? '?' + qs : ''}`);
  },
  getJob: (id) => request(`/jobs/${id}`),

  // Applications
  getApplications: () => request('/applications'),
  createApplication: (data) => request('/applications', { method: 'POST', body: data }),
  updateApplication: (id, data) => request(`/applications/${id}`, { method: 'PATCH', body: data }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: 'DELETE' }),

  // Cover Letter
  generateCoverLetter: (data) => request('/cover-letter/generate', { method: 'POST', body: data }),
  getCoverLetters: () => request('/cover-letter'),
  getCoverLetterByJob: (jobId) => request(`/cover-letter/job/${jobId}`),
  updateCoverLetter: (id, data) => request(`/cover-letter/${id}`, { method: 'PUT', body: data }),
};

export default api;
