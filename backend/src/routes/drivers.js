const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/database');
const { authenticateToken, requireDriver, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/v1/drivers/register
 * @desc    Register as a driver (additional driver info)
 * @access  Private
 */
router.post('/register', [
  authenticateToken,
  body('licenseNumber').trim().isLength({ min: 1 }),
  body('licenseExpiry').isISO8601(),
  body('vehicleMake').trim().isLength({ min: 1 }),
  body('vehicleModel').trim().isLength({ min: 1 }),
  body('vehicleYear').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('vehicleColor').trim().isLength({ min: 1 }),
  body('vehiclePlate').trim().isLength({ min: 1 }),
  body('vehicleType').isIn(['economy', 'sedan', 'suv', 'premium', 'xl']),
  body('insurancePolicy').trim().isLength({ min: 1 }),
  body('insuranceExpiry').isISO8601()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    licenseNumber,
    licenseExpiry,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleColor,
    vehiclePlate,
    vehicleType,
    insurancePolicy,
    insuranceExpiry
  } = req.body;

  try {
    // Check if user is already a driver
    const { data: existingDriver } = await supabaseAdmin
      .from('drivers')
      .select('id')
      .eq('id', req.user.id)
      .single();

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Already registered as a driver'
      });
    }

    // Update user role to driver
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'driver' })
      .eq('id', req.user.id);

    // Create driver record
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('drivers')
      .insert({
        id: req.user.id,
        license_number: licenseNumber,
        license_expiry: licenseExpiry,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_year: vehicleYear,
        vehicle_color: vehicleColor,
        vehicle_plate: vehiclePlate,
        vehicle_type: vehicleType,
        insurance_policy: insurancePolicy,
        insurance_expiry: insuranceExpiry,
        status: 'offline',
        verification_status: 'pending'
      })
      .select()
      .single();

    if (driverError) {
      logger.error('Driver registration failed:', driverError);
      return res.status(400).json({
        success: false,
        message: 'Failed to register as driver'
      });
    }

    logger.info(`Driver registered: ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Driver registration submitted for review',
      data: { driver }
    });
  } catch (error) {
    logger.error('Driver registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   PUT /api/v1/drivers/status
 * @desc    Update driver status (online/offline/etc)
 * @access  Private (Drivers)
 */
router.put('/status', [
  authenticateToken,
  requireDriver,
  body('status').isIn(['offline', 'available', 'busy', 'on_break'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
      errors: errors.array()
    });
  }

  const { status } = req.body;

  try {
    const { data: driver, error } = await supabaseAdmin
      .from('drivers')
      .update({ status })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      logger.error('Driver status update failed:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to update status'
      });
    }

    logger.info(`Driver ${req.user.id} status updated to: ${status}`);

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: { driver }
    });
  } catch (error) {
    logger.error('Driver status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   PUT /api/v1/drivers/location
 * @desc    Update driver location
 * @access  Private (Drivers)
 */
router.put('/location', [
  authenticateToken,
  requireDriver,
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('heading').optional().isFloat({ min: 0, max: 360 }),
  body('speed').optional().isFloat({ min: 0 }),
  body('accuracy').optional().isFloat({ min: 0 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid location data',
      errors: errors.array()
    });
  }

  const { latitude, longitude, heading, speed, accuracy } = req.body;

  try {
    // Update driver's current location
    await supabaseAdmin
      .from('drivers')
      .update({
        current_location: `POINT(${longitude} ${latitude})`
      })
      .eq('id', req.user.id);

    // Insert location tracking record
    await supabaseAdmin
      .from('driver_locations')
      .insert({
        driver_id: req.user.id,
        location: `POINT(${longitude} ${latitude})`,
        heading,
        speed,
        accuracy
      });

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    logger.error('Driver location update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   GET /api/v1/drivers/earnings
 * @desc    Get driver earnings summary
 * @access  Private (Drivers)
 */
router.get('/earnings', [
  authenticateToken,
  requireDriver,
  query('period').optional().isIn(['today', 'week', 'month', 'year'])
], asyncHandler(async (req, res) => {
  const { period = 'today' } = req.query;

  try {
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = weekAgo.toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter = monthAgo.toISOString();
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        dateFilter = yearAgo.toISOString();
        break;
    }

    const { data: earnings, error } = await supabaseAdmin
      .from('payments')
      .select('driver_earnings, created_at')
      .eq('driver_id', req.user.id)
      .eq('status', 'completed')
      .gte('created_at', dateFilter);

    if (error) {
      logger.error('Failed to fetch earnings:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch earnings'
      });
    }

    const totalEarnings = earnings.reduce((sum, payment) => sum + parseFloat(payment.driver_earnings || 0), 0);
    const rideCount = earnings.length;

    res.json({
      success: true,
      data: {
        period,
        totalEarnings: totalEarnings.toFixed(2),
        rideCount,
        averagePerRide: rideCount > 0 ? (totalEarnings / rideCount).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    logger.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   GET /api/v1/drivers/profile
 * @desc    Get driver profile
 * @access  Private (Drivers)
 */
router.get('/profile', [
  authenticateToken,
  requireDriver
], asyncHandler(async (req, res) => {
  try {
    const { data: driver, error } = await supabaseAdmin
      .from('drivers')
      .select(`
        *,
        profile:profiles(first_name, last_name, phone, avatar_url)
      `)
      .eq('id', req.user.id)
      .single();

    if (error || !driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    res.json({
      success: true,
      data: { driver }
    });
  } catch (error) {
    logger.error('Get driver profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

module.exports = router;