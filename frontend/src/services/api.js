import axios from 'axios'
import { supabase } from './supabase'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      supabase.auth.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
}

// Ride API calls
export const rideAPI = {
  requestRide: (rideData) => api.post('/rides/request', rideData),
  getRides: (params = {}) => api.get('/rides', { params }),
  getRide: (rideId) => api.get(`/rides/${rideId}`),
  acceptRide: (rideId) => api.post(`/rides/${rideId}/accept`),
  updateRideStatus: (rideId, status) => api.put(`/rides/${rideId}/status`, { status }),
  cancelRide: (rideId, reason) => api.post(`/rides/${rideId}/cancel`, { reason }),
}

// Driver API calls
export const driverAPI = {
  register: (driverData) => api.post('/drivers/register', driverData),
  updateStatus: (status) => api.put('/drivers/status', { status }),
  updateLocation: (locationData) => api.put('/drivers/location', locationData),
  getProfile: () => api.get('/drivers/profile'),
  getEarnings: (period) => api.get('/drivers/earnings', { params: { period } }),
}

// Payment API calls
export const paymentAPI = {
  processPayment: (paymentData) => api.post('/payments/process', paymentData),
}

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingDrivers: () => api.get('/admin/drivers/pending'),
  verifyDriver: (driverId, status, notes) => api.put(`/admin/drivers/${driverId}/verify`, { status, notes }),
}

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    }
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'Network error - please check your connection',
      status: 0,
    }
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
    }
  }
}

export default api