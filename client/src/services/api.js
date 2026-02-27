import axios from 'axios';

// Define the BASE_URL to connect the backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials)
};

// Users API calls
export const usersAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
  getCompleteProfile: (userId) => api.get(`/users/${userId}/complete`)
};

// Skills API calls
export const skillsAPI = {
  getAll: () => api.get('/skills'),
  create: (skillData) => api.post('/skills', skillData),
  getUserSkills: (userId) => api.get(`/skills/user/${userId}`),
  addToUser: (userId, skillData) => api.post(`/skills/user/${userId}`, skillData),
  updateUserSkill: (userId, skillId, data) => api.put(`/skills/user/${userId}/${skillId}`, data),
  deleteUserSkill: (userId, skillId) => api.delete(`/skills/user/${userId}/${skillId}`)
};

// Certifications API calls
export const certificationsAPI = {
  getAll: () => api.get('/certifications'),
  create: (certData) => api.post('/certifications', certData),
  getUserCertifications: (userId) => api.get(`/certifications/user/${userId}`),
  addToUser: (userId, certData) => api.post(`/certifications/user/${userId}`, certData),
  updateUserCertification: (userId, certId, data) => api.put(`/certifications/user/${userId}/${certId}`, data),
  deleteUserCertification: (userId, certId) => api.delete(`/certifications/user/${userId}/${certId}`)
};

export default api;