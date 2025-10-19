const express = require('express');
const { query, param, body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  try {
    // Get various statistics
    const [
      totalUsers,
      totalDrivers,
      totalRides,
      totalPayments,
      activeRides,
      pendingDrivers
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('drivers').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('rides').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('payments').select('amount').eq('status', 'completed'),
      supabaseAdmin.from('rides').select('*', { count: 'exact', head: true }).in('status', ['requested', 'accepted', 'driver_en_route', 'in_progress']),
      supabaseAdmin.from('drivers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending')
    ]);

    const totalRevenue = totalPayments.data?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers.count || 0,
        totalDrivers: totalDrivers.count || 0,
        totalRides: totalRides.count || 0,
        activeRides: activeRides.count || 0,
        pendingDrivers: pendingDrivers.count || 0,
        totalRevenue: totalRevenue.toFixed(2)
      }
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   GET /api/v1/admin/drivers/pending
 * @desc    Get pending driver verifications
 * @access  Private (Admin)
 */
router.get('/drivers/pending', asyncHandler(async (req, res) => {
  try {
    const { data: drivers, error } = await supabaseAdmin
      .from('drivers')
      .select(`
        *,
        profile:profiles(first_name, last_name, email, phone)
      `)
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch pending drivers:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch pending drivers'
      });
    }

    res.json({
      success: true,
      data: { drivers }
    });
  } catch (error) {
    logger.error('Get pending drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   PUT /api/v1/admin/drivers/:driverId/verify
 * @desc    Approve or reject driver verification
 * @access  Private (Admin)
 */
router.put('/drivers/:driverId/verify', [
  param('driverId').isUUID(),
  body('status').isIn(['approved', 'rejected']),
  body('notes').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { driverId } = req.params;
  const { status, notes } = req.body;

  try {
    const { data: driver, error } = await supabaseAdmin
      .from('drivers')
      .update({
        verification_status: status,
        is_active: status === 'approved'
      })
      .eq('id', driverId)
      .select()
      .single();

    if (error) {
      logger.error('Driver verification update failed:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to update driver verification'
      });
    }

    logger.info(`Driver ${driverId} verification status updated to: ${status} by admin: ${req.user.id}`);

    res.json({
      success: true,
      message: `Driver ${status} successfully`,
      data: { driver }
    });
  } catch (error) {
    logger.error('Driver verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

module.exports = router;