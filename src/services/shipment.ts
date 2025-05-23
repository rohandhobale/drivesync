import api from './api';

export const createShipment = async (shipmentData: any) => {
  try {
    const response = await api.post('/shipments', shipmentData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getBusinessShipments = async () => {
  try {
    const response = await api.get('/shipments/business');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getCityShipments = async (city: string) => {
  try {
    const response = await api.get(`/shipments/city/${city}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const requestShipment = async (shipmentId: string) => {
  try {
    const response = await api.post(`/shipments/${shipmentId}/request`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const handleDriverRequest = async (
  shipmentId: string,
  requestId: string,
  status: 'accepted' | 'rejected'
) => {
  try {
    const response = await api.patch(`/shipments/${shipmentId}/request/${requestId}`, { status });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const updateShipmentStatus = async (shipmentId: string, status: string, location?: { lat: number; lng: number }) => {
  try {
    const response = await api.patch(`/shipments/${shipmentId}/status`, { status, location });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const updateShipmentLocations = async (
  shipmentId: string,
  pickupLocation?: { lat: number; lng: number },
  dropoffLocation?: { lat: number; lng: number }
) => {
  try {
    const response = await api.patch(`/shipments/${shipmentId}/locations`, {
      pickupLocation,
      dropoffLocation
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const updateCurrentLocation = async (
  shipmentId: string,
  location: { lat: number; lng: number }
) => {
  try {
    const response = await api.patch(`/shipments/${shipmentId}/current-location`, { location });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};