import api from './api';

export const getBusinessProfile = async () => {
  try {
    const response = await api.get('/business/profile');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const updateBusinessProfile = async (profileData: any) => {
  try {
    const response = await api.patch('/business/profile', profileData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};