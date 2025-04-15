import api from './api';

export const getDriverProfile = async () => {
  try {
    const response = await api.get('/driver/profile');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const updateDriverProfile = async (profileData: any) => {
  try {
    const response = await api.patch('/driver/profile', profileData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getDriverShipments = async () => {
  try {
    const response = await api.get('/driver/shipments');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};