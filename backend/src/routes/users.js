const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', [
  authenticateToken,
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone(),
  body('emergencyContactName').optional().trim(),
  body('emergencyContactPhone').optional().isMobilePhone()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const updateData = {};
  const { firstName, lastName, phone, emergencyContactName, emergencyContactPhone } = req.body;

  if (firstName) updateData.first_name = firstName;
  if (lastName) updateData.last_name = lastName;
  if (phone) updateData.phone = phone;
  if (emergencyContactName) updateData.emergency_contact_name = emergencyContactName;
  if (emergencyContactPhone) updateData.emergency_contact_phone = emergencyContactPhone;

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      logger.error('Profile update failed:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    logger.info(`Profile updated for user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

module.exports = router;