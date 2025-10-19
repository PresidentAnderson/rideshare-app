const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/database');
const { authenticateToken, requireDriver } = require('../middleware/auth');
const { rideRequestLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/v1/rides/request
 * @desc    Request a new ride
 * @access  Private (Riders)
 */
router.post('/request', [
  authenticateToken,
  rideRequestLimiter,
  body('pickupAddress').trim().isLength({ min: 1 }),
  body('dropoffAddress').trim().isLength({ min: 1 }),
  body('pickupLat').isFloat({ min: -90, max: 90 }),
  body('pickupLng').isFloat({ min: -180, max: 180 }),
  body('dropoffLat').isFloat({ min: -90, max: 90 }),
  body('dropoffLng').isFloat({ min: -180, max: 180 }),
  body('passengerCount').optional().isInt({ min: 1, max: 8 }),
  body('specialInstructions').optional().trim(),
  body('vehicleType').optional().isIn(['economy', 'sedan', 'suv', 'premium', 'xl'])
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
    pickupAddress,
    dropoffAddress,
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    passengerCount = 1,
    specialInstructions,
    vehicleType = 'sedan'
  } = req.body;

  try {
    // Check if user has any active rides
    const { data: activeRides } = await supabaseAdmin
      .from('rides')
      .select('id')
      .eq('rider_id', req.user.id)
      .in('status', ['requested', 'accepted', 'driver_en_route', 'in_progress']);

    if (activeRides && activeRides.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active ride'
      });
    }

    // Calculate estimated distance and fare using PostGIS
    const { data: estimateData } = await supabaseAdmin.rpc('calculate_ride_estimate', {
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      dropoff_lat: dropoffLat,
      dropoff_lng: dropoffLng,
      vehicle_type: vehicleType
    });

    const estimatedDistance = estimateData?.distance || 0;
    const estimatedDuration = estimateData?.duration || 0;
    const estimatedFare = estimateData?.fare || 0;

    // Create ride request
    const { data: ride, error: rideError } = await supabaseAdmin
      .from('rides')
      .insert({
        rider_id: req.user.id,
        pickup_location: `POINT(${pickupLng} ${pickupLat})`,
        pickup_address: pickupAddress,
        dropoff_location: `POINT(${dropoffLng} ${dropoffLat})`,
        dropoff_address: dropoffAddress,
        estimated_distance_km: estimatedDistance,
        estimated_duration_minutes: estimatedDuration,
        fare_total: estimatedFare,
        passenger_count: passengerCount,
        special_instructions: specialInstructions,
        status: 'requested'
      })
      .select()
      .single();

    if (rideError) {
      logger.error('Ride creation failed:', rideError);
      return res.status(400).json({
        success: false,
        message: 'Failed to create ride request'
      });
    }

    // Find nearby drivers
    const { data: nearbyDrivers } = await supabaseAdmin.rpc('get_nearby_drivers', {
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      radius_km: 10
    });

    // Emit ride request to nearby drivers via Socket.IO
    req.io?.to('drivers').emit('new_ride_request', {
      rideId: ride.id,
      pickup: { lat: pickupLat, lng: pickupLng, address: pickupAddress },
      dropoff: { lat: dropoffLat, lng: dropoffLng, address: dropoffAddress },
      fare: estimatedFare,
      distance: estimatedDistance,
      duration: estimatedDuration,
      passengerCount
    });

    logger.info(`Ride request created: ${ride.id} by user: ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Ride requested successfully',
      data: {
        ride,
        nearbyDriversCount: nearbyDrivers?.length || 0,
        estimatedFare,
        estimatedDistance,
        estimatedDuration
      }
    });
  } catch (error) {
    logger.error('Ride request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   POST /api/v1/rides/:rideId/accept
 * @desc    Accept a ride request (Driver)
 * @access  Private (Drivers)
 */
router.post('/:rideId/accept', [
  authenticateToken,
  requireDriver,
  param('rideId').isUUID()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ride ID'
    });
  }

  const { rideId } = req.params;

  try {
    // Check if driver has active rides
    const { data: activeRides } = await supabaseAdmin
      .from('rides')
      .select('id')
      .eq('driver_id', req.user.id)
      .in('status', ['accepted', 'driver_en_route', 'in_progress']);

    if (activeRides && activeRides.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active ride'
      });
    }

    // Check if ride exists and is available
    const { data: ride, error: rideError } = await supabaseAdmin
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .eq('status', 'requested')
      .single();

    if (rideError || !ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found or already accepted'
      });
    }

    // Update ride with driver and status
    const { data: updatedRide, error: updateError } = await supabaseAdmin
      .from('rides')
      .update({
        driver_id: req.user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', rideId)
      .eq('status', 'requested') // Double-check to prevent race conditions
      .select()
      .single();

    if (updateError || !updatedRide) {
      return res.status(400).json({
        success: false,
        message: 'Failed to accept ride (may have been taken by another driver)'
      });
    }

    // Update driver status
    await supabaseAdmin
      .from('drivers')
      .update({ status: 'busy' })
      .eq('id', req.user.id);

    // Get rider and driver info for notifications
    const { data: riderProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', ride.rider_id)
      .single();

    const { data: driverProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', req.user.id)
      .single();

    // Notify rider that ride was accepted
    req.io?.to(`user_${ride.rider_id}`).emit('ride_accepted', {
      rideId: updatedRide.id,
      driver: {
        id: req.user.id,
        name: `${driverProfile?.first_name} ${driverProfile?.last_name}`,
        // Add vehicle info, rating, etc.
      }
    });

    logger.info(`Ride ${rideId} accepted by driver: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Ride accepted successfully',
      data: {
        ride: updatedRide,
        rider: riderProfile
      }
    });
  } catch (error) {
    logger.error('Ride accept error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   PUT /api/v1/rides/:rideId/status
 * @desc    Update ride status
 * @access  Private (Drivers)
 */
router.put('/:rideId/status', [
  authenticateToken,
  requireDriver,
  param('rideId').isUUID(),
  body('status').isIn(['driver_en_route', 'in_progress', 'completed'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { rideId } = req.params;
  const { status } = req.body;

  try {
    // Verify driver owns this ride
    const { data: ride } = await supabaseAdmin
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .eq('driver_id', req.user.id)
      .single();

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const updateData = { status };
    
    // Add timestamps based on status
    if (status === 'in_progress') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      // Update driver status back to available
      await supabaseAdmin
        .from('drivers')
        .update({ status: 'available' })
        .eq('id', req.user.id);
    }

    const { data: updatedRide, error } = await supabaseAdmin
      .from('rides')
      .update(updateData)
      .eq('id', rideId)
      .select()
      .single();

    if (error) {
      logger.error('Ride status update failed:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to update ride status'
      });
    }

    // Notify rider of status change
    req.io?.to(`user_${ride.rider_id}`).emit('ride_status_updated', {
      rideId: updatedRide.id,
      status: updatedRide.status
    });

    logger.info(`Ride ${rideId} status updated to: ${status}`);

    res.json({
      success: true,
      message: 'Ride status updated successfully',
      data: { ride: updatedRide }
    });
  } catch (error) {
    logger.error('Ride status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   GET /api/v1/rides
 * @desc    Get user's rides
 * @access  Private
 */
router.get('/', [
  authenticateToken,
  query('status').optional().isIn(['requested', 'accepted', 'driver_en_route', 'in_progress', 'completed', 'cancelled']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], asyncHandler(async (req, res) => {
  const { status, limit = 20, offset = 0 } = req.query;

  try {
    let query = supabaseAdmin
      .from('rides')
      .select(`
        *,
        rider:profiles!rides_rider_id_fkey(first_name, last_name, phone),
        driver:profiles!rides_driver_id_fkey(first_name, last_name, phone)
      `)
      .or(`rider_id.eq.${req.user.id},driver_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: rides, error } = await query;

    if (error) {
      logger.error('Failed to fetch rides:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch rides'
      });
    }

    res.json({
      success: true,
      data: {
        rides,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: rides.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   GET /api/v1/rides/:rideId
 * @desc    Get specific ride details
 * @access  Private
 */
router.get('/:rideId', [
  authenticateToken,
  param('rideId').isUUID()
], asyncHandler(async (req, res) => {
  const { rideId } = req.params;

  try {
    const { data: ride, error } = await supabaseAdmin
      .from('rides')
      .select(`
        *,
        rider:profiles!rides_rider_id_fkey(first_name, last_name, phone),
        driver:profiles!rides_driver_id_fkey(first_name, last_name, phone),
        payments(*)
      `)
      .eq('id', rideId)
      .or(`rider_id.eq.${req.user.id},driver_id.eq.${req.user.id}`)
      .single();

    if (error || !ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.json({
      success: true,
      data: { ride }
    });
  } catch (error) {
    logger.error('Get ride details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   POST /api/v1/rides/:rideId/cancel
 * @desc    Cancel a ride
 * @access  Private
 */
router.post('/:rideId/cancel', [
  authenticateToken,
  param('rideId').isUUID(),
  body('reason').optional().trim()
], asyncHandler(async (req, res) => {
  const { rideId } = req.params;
  const { reason } = req.body;

  try {
    const { data: ride } = await supabaseAdmin
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .or(`rider_id.eq.${req.user.id},driver_id.eq.${req.user.id}`)
      .single();

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this ride'
      });
    }

    const { data: updatedRide, error } = await supabaseAdmin
      .from('rides')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('id', rideId)
      .select()
      .single();

    if (error) {
      logger.error('Ride cancellation failed:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to cancel ride'
      });
    }

    // If driver had accepted, update their status back to available
    if (ride.driver_id) {
      await supabaseAdmin
        .from('drivers')
        .update({ status: 'available' })
        .eq('id', ride.driver_id);

      // Notify the other party
      const otherUserId = req.user.id === ride.rider_id ? ride.driver_id : ride.rider_id;
      req.io?.to(`user_${otherUserId}`).emit('ride_cancelled', {
        rideId: updatedRide.id,
        reason
      });
    }

    logger.info(`Ride ${rideId} cancelled by user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      data: { ride: updatedRide }
    });
  } catch (error) {
    logger.error('Ride cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

module.exports = router;