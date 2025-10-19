const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const driverRoutes = require('./driver');
const rideRoutes = require('./rides');
const paymentRoutes = require('./payments');
const ratingRoutes = require('./ratings');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API information endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Ridesharing API',
    version: '1.0.0',
    description: 'Complete ridesharing application backend API',
    endpoints: {
      auth: '/api/v1/auth',
      drivers: '/api/v1/drivers',
      rides: '/api/v1/rides',
      payments: '/api/v1/payments',
      ratings: '/api/v1/ratings',
    },
    documentation: {
      health: 'GET /api/v1/health',
      register: 'POST /api/v1/auth/register',
      login: 'POST /api/v1/auth/login',
      'request-ride': 'POST /api/v1/rides/request',
      'nearby-drivers': 'GET /api/v1/drivers/nearby',
    },
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/drivers', driverRoutes);
router.use('/rides', rideRoutes);
router.use('/payments', paymentRoutes);
router.use('/ratings', ratingRoutes);

module.exports = router;