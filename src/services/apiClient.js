// src/services/apiClient.js
// Centralized REST API client for SocietySync communicating with Express & SQLite backend

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  // If not FormData, set Content-Type JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const apiClient = {
  // Health & Backend Status
  getHealth: () => request('/health'),

  // Dashboard Stats
  getDashboardStats: () => request('/dashboard/stats'),

  // Complaints
  getComplaints: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.category && params.category !== 'ALL') searchParams.append('category', params.category);
    if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
    if (params.priority && params.priority !== 'ALL') searchParams.append('priority', params.priority);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request(`/complaints${qs}`);
  },
  getComplaint: (id) => request(`/complaints/${id}`),
  createComplaint: (data) => request('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  updateComplaint: (id, data) => request(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteComplaint: (id) => request(`/complaints/${id}`, { method: 'DELETE' }),

  // Image Upload
  uploadImage: async (file) => {
    // Client-side pre-validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported image format. Please upload JPEG, PNG, or WebP.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image exceeds 5MB size limit. Please choose a smaller image.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const res = await request('/upload', {
      method: 'POST',
      body: formData
    });
    return res;
  },

  // Events
  getEvents: () => request('/events'),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  rsvpEvent: (id, data) => request(`/events/${id}/rsvp`, { method: 'POST', body: JSON.stringify(data) }),

  // Announcements
  getAnnouncements: () => request('/announcements'),
  createAnnouncement: (data) => request('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id) => request(`/announcements/${id}`, { method: 'DELETE' }),

  // Residents
  getResidents: () => request('/residents'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Reset Data
  resetDemoData: () => request('/reset-data', { method: 'POST' }),

  // AI Diagnostic Analysis
  analyzeComplaint: (title, description) =>
    request('/ai/analyze-complaint', {
      method: 'POST',
      body: JSON.stringify({ title, description })
    })
};
