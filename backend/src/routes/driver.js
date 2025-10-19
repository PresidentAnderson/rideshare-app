const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticate, authorize } = require('../middleware/auth');
const { locationLimiter } = require('../middleware/rateLimiter');
const { validate, driverRegistrationSchema, updateLocationSchema } = require('../middleware/validation');

// Driver registration (any authenticated user can register as driver)
router.post('/register', 
  authenticate, 
  validate(driverRegistrationSchema), 
  driverController.registerDriver
);

// Driver profile routes
router.get('/profile', authenticate, authorize('driver', 'admin'), driverController.getDriverProfile);
router.get('/stats', authenticate, authorize('driver', 'admin'), driverController.getDriverStats);

// Driver status and location routes
router.put('/status', authenticate, authorize('driver'), driverController.updateDriverStatus);
router.put('/location', 
  authenticate, 
  authorize('driver'), 
  locationLimiter, 
  validate(updateLocationSchema), 
  driverController.updateLocation
);

// Public routes for finding drivers
router.get('/nearby', driverController.getNearbyDrivers);

module.exports = router;