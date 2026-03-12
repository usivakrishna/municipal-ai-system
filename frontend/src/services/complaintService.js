import api from './api';

const createComplaint = async (formData) => {
  const response = await api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const getComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data;
};

const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

const updateComplaint = async (id, payload) => {
  const isFormData = payload instanceof FormData;
  const response = await api.put(`/complaints/${id}`, payload, {
    headers: isFormData
      ? {
          'Content-Type': 'multipart/form-data'
        }
      : undefined
  });
  return response.data;
};

const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};

export default {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
};
