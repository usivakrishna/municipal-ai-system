import api from './api';

const getDelayedComplaints = async (params = {}) => {
  const response = await api.get('/admin/delayed', { params });
  return response.data;
};

const getDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export default {
  getDelayedComplaints,
  getDashboard
};
