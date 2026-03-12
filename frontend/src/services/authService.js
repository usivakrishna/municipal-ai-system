import api from './api';

const register = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

const login = async (payload) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export default {
  register,
  login
};
