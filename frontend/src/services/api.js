import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('municipal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUploadUrl = (imagePath) => {
  const base = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000';
  return imagePath ? `${base}${imagePath}` : null;
};

export default api;
