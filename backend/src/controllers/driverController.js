const { Driver, User } = require('../models');
const { Op } = require('sequelize');
const { setToCache, getFromCache } = require('../config/redis');

const registerDriver = async (req, res) => {
  try {
    const {
      licenseNumber,
      licenseExpiry,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      licensePlate,
      vehicleType,
    } = req.body;

    const userId = req.user.id;

    // Check if user is already registered as driver
    const existingDriver = await Driver.findOne({ where: { userId } });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'User is already registered as a driver',
      });
    }

    // Check if license number already exists
    const existingLicense = await Driver.findOne({ where: { licenseNumber } });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'License number is already registered',
      });
    }

    // Check if license plate already exists
    const existingPlate = await Driver.findOne({ where: { licensePlate } });
    if (existingPlate) {
      return res.status(400).json({
        success: false,
        message: 'License plate is already registered',
      });
    }

    // Create driver profile
    const driver = await Driver.create({
      userId,
      licenseNumber,
      licenseExpiry,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      licensePlate,
      vehicleType: vehicleType || 'economy',
    });

    // Update user role to driver
    await User.update({ role: 'driver' }, { where: { id: userId } });

    res.status(201).json({
      success: true,
      message: 'Driver profile created successfully',
      data: { driver },
    });
  } catch (error) {
    console.error('Driver registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getDriverProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const driver = await Driver.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'rating', 'totalRides'],
        },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    res.json({
      success: true,
      data: { driver },
    });
  } catch (error) {
    console.error('Get driver profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateDriverStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const userId = req.user.id;

    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    if (!driver.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Driver profile is not approved yet',
      });
    }

    await driver.update({ isOnline });

    // Update cache
    await setToCache(`driver:${driver.id}`, driver.toJSON(), 300);

    res.json({
      success: true,
      message: `Driver status updated to ${isOnline ? 'online' : 'offline'}`,
      data: { driver },
    });
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user.id;

    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    await driver.update({
      currentLat: lat,
      currentLng: lng,
    });

    // Cache driver location for quick access
    await setToCache(`driver_location:${driver.id}`, { lat, lng }, 60);

    res.json({
      success: true,
      message: 'Location updated successfully',
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getNearbyDrivers = async (req, res) => {
  try {
    const { lat, lng, radius = 5, vehicleType } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Build where clause
    const whereClause = {
      isOnline: true,
      isApproved: true,
      currentLat: { [Op.not]: null },
      currentLng: { [Op.not]: null },
    };

    if (vehicleType) {
      whereClause.vehicleType = vehicleType;
    }

    // Get drivers within radius (simplified calculation)
    const radiusInDegrees = radius / 111; // Approximate conversion km to degrees

    const drivers = await Driver.findAll({
      where: {
        ...whereClause,
        currentLat: {
          [Op.between]: [lat - radiusInDegrees, lat + radiusInDegrees],
        },
        currentLng: {
          [Op.between]: [lng - radiusInDegrees, lng + radiusInDegrees],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'rating', 'totalRides'],
        },
      ],
      limit: 20,
    });

    res.json({
      success: true,
      data: { drivers },
    });
  } catch (error) {
    console.error('Get nearby drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getDriverStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    // Get stats from cache first
    const cacheKey = `driver_stats:${driver.id}`;
    let stats = await getFromCache(cacheKey);

    if (!stats) {
      // Calculate stats if not in cache
      const { Ride } = require('../models');
      
      const totalRides = await Ride.count({
        where: { driverId: userId, status: 'completed' },
      });

      const thisMonthRides = await Ride.count({
        where: {
          driverId: userId,
          status: 'completed',
          completedAt: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      });

      stats = {
        totalRides,
        thisMonthRides,
        totalEarnings: parseFloat(driver.totalEarnings),
        rating: req.user.rating,
        isOnline: driver.isOnline,
        isApproved: driver.isApproved,
      };

      // Cache for 5 minutes
      await setToCache(cacheKey, stats, 300);
    }

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  registerDriver,
  getDriverProfile,
  updateDriverStatus,
  updateLocation,
  getNearbyDrivers,
  getDriverStats,
};