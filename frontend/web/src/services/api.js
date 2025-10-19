import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Driver API
export const driverAPI = {
  registerDriver: (driverData) => api.post('/drivers/register', driverData),
  getDriverProfile: () => api.get('/drivers/profile'),
  updateDriverStatus: (statusData) => api.put('/drivers/status', statusData),
  updateLocation: (locationData) => api.put('/drivers/location', locationData),
  getDriverStats: () => api.get('/drivers/stats'),
  getNearbyDrivers: (params) => api.get('/drivers/nearby', { params }),
};

// Ride API
export const rideAPI = {
  requestRide: (rideData) => api.post('/rides/request', rideData),
  acceptRide: (rideId) => api.post(`/rides/${rideId}/accept`),
  updateRideStatus: (rideId, statusData) => api.put(`/rides/${rideId}/status`, statusData),
  cancelRide: (rideId, reasonData) => api.post(`/rides/${rideId}/cancel`, reasonData),
  getRideHistory: (params) => api.get('/rides', { params }),
  getRideDetails: (rideId) => api.get(`/rides/${rideId}`),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (paymentData) => api.post('/payments/intent', paymentData),
  confirmPayment: (paymentId, confirmData) => api.post(`/payments/${paymentId}/confirm`, confirmData),
  getPaymentHistory: (params) => api.get('/payments', { params }),
  refundPayment: (paymentId, refundData) => api.post(`/payments/${paymentId}/refund`, refundData),
};

// Rating API
export const ratingAPI = {
  createRating: (ratingData) => api.post('/ratings', ratingData),
  getUserRatings: (userId, params) => api.get(`/ratings/user/${userId}`, { params }),
  getRideRatings: (rideId) => api.get(`/ratings/ride/${rideId}`),
  updateRating: (ratingId, ratingData) => api.put(`/ratings/${ratingId}`, ratingData),
  deleteRating: (ratingId) => api.delete(`/ratings/${ratingId}`),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isServerError = (error) => {
  return error.response && error.response.status >= 500;
};

export const isClientError = (error) => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
};

export default api;