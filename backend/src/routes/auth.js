const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/database');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [
  authRateLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone(),
  body('role').optional().isIn(['rider', 'driver'])
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password, firstName, lastName, phone, role = 'rider' } = req.body;

  try {
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      logger.error('User registration failed:', authError);
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        role
      })
      .select()
      .single();

    if (profileError) {
      logger.error('Profile creation failed:', profileError);
      // If profile creation fails, we should clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return res.status(400).json({
        success: false,
        message: 'Failed to create user profile'
      });
    }

    logger.info(`New user registered: ${email} with role: ${role}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile.role
        }
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', [
  authRateLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {
    // Sign in with Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateAccessToken({
      email,
      password
    });

    if (authError) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile?.role || 'rider',
          profile
        },
        token: authData.access_token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', asyncHandler(async (req, res) => {
  // In JWT-based auth, logout is typically handled client-side
  // But we can add token blacklisting here if needed
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', [
  authRateLimiter,
  body('email').isEmail().normalizeEmail()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
  }

  const { email } = req.body;

  try {
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email
    });

    if (error) {
      logger.error('Password reset request failed:', error);
    }

    // Always return success for security reasons
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  }
}));

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', [
  authRateLimiter,
  body('token').exists(),
  body('password').isLength({ min: 6 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { token, password } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(token, {
      password
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    logger.info(`Password reset successful for user: ${data.user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

module.exports = router;