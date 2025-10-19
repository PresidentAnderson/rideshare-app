const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { setToCache, deleteFromCache } = require('../config/redis');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ where: { phoneNumber } });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists',
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role: role || 'rider',
    });

    // Generate token
    const token = generateToken(user.id);

    // Cache user data
    await setToCache(`user:${user.id}`, user.toJSON(), 900);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user.id);

    // Cache user data
    await setToCache(`user:${user.id}`, user.toJSON(), 900);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const logout = async (req, res) => {
  try {
    // Remove user from cache
    await deleteFromCache(`user:${req.user.id}`);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          association: 'driverProfile',
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, profilePicture } = req.body;
    const userId = req.user.id;

    // Check if phone number is being changed and is already taken
    if (phoneNumber && phoneNumber !== req.user.phoneNumber) {
      const existingPhone = await User.findOne({ 
        where: { 
          phoneNumber,
          id: { [require('sequelize').Op.ne]: userId }
        } 
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already in use',
        });
      }
    }

    // Update user
    const [updatedRows] = await User.update(
      { firstName, lastName, phoneNumber, profilePicture },
      { where: { id: userId } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get updated user
    const user = await User.findByPk(userId);

    // Update cache
    await setToCache(`user:${userId}`, user.toJSON(), 900);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = generateToken(req.user.id);

    res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  refreshToken,
};