const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/v1/payments/process
 * @desc    Process payment for a ride
 * @access  Private
 */
router.post('/process', [
  authenticateToken,
  body('rideId').isUUID(),
  body('paymentMethod').trim().isLength({ min: 1 }),
  body('amount').isFloat({ min: 0 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { rideId, paymentMethod, amount } = req.body;

  try {
    // Verify ride belongs to user and is completed
    const { data: ride, error: rideError } = await supabaseAdmin
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .eq('rider_id', req.user.id)
      .eq('status', 'completed')
      .single();

    if (rideError || !ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found or not eligible for payment'
      });
    }

    // Check if payment already exists
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('ride_id', rideId)
      .single();

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed for this ride'
      });
    }

    // Calculate platform fee (20% for example)
    const platformFeeRate = 0.20;
    const platformFee = amount * platformFeeRate;
    const driverEarnings = amount - platformFee;

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        ride_id: rideId,
        rider_id: req.user.id,
        driver_id: ride.driver_id,
        amount,
        payment_method: paymentMethod,
        status: 'completed',
        driver_earnings: driverEarnings,
        platform_fee: platformFee,
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      logger.error('Payment creation failed:', paymentError);
      return res.status(400).json({
        success: false,
        message: 'Failed to process payment'
      });
    }

    // Update driver earnings
    await supabaseAdmin
      .from('drivers')
      .update({
        earnings_total: supabaseAdmin.raw(`earnings_total + ${driverEarnings}`),
        total_rides: supabaseAdmin.raw('total_rides + 1')
      })
      .eq('id', ride.driver_id);

    logger.info(`Payment processed: ${payment.id} for ride: ${rideId}`);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: { payment }
    });
  } catch (error) {
    logger.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

module.exports = router;