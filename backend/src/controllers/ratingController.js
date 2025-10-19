const { Rating, Ride, User } = require('../models');
const { setToCache, deleteFromCache } = require('../config/redis');

const createRating = async (req, res) => {
  try {
    const { rideId, rating, comment, categories } = req.body;
    const fromUserId = req.user.id;

    // Find the ride
    const ride = await Ride.findByPk(rideId, {
      include: [
        {
          model: User,
          as: 'rider',
        },
        {
          model: User,
          as: 'driver',
        },
      ],
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Check if ride is completed
    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed rides',
      });
    }

    // Check if user is part of this ride
    if (ride.riderId !== fromUserId && ride.driverId !== fromUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this ride',
      });
    }

    // Determine who is being rated
    const toUserId = ride.riderId === fromUserId ? ride.driverId : ride.riderId;
    const isDriverRating = ride.riderId === fromUserId; // true if rider is rating driver

    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot rate: missing driver information',
      });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: {
        rideId,
        fromUserId,
        toUserId,
      },
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Rating already exists for this ride',
      });
    }

    // Create rating
    const newRating = await Rating.create({
      rideId,
      fromUserId,
      toUserId,
      rating,
      comment,
      categories,
      isDriverRating,
    });

    // Update user's average rating
    await updateUserRating(toUserId);

    // Clear user cache to force rating refresh
    await deleteFromCache(`user:${toUserId}`);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: { rating: newRating },
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateUserRating = async (userId) => {
  try {
    const { Op } = require('sequelize');
    
    // Calculate average rating
    const ratingData = await Rating.findOne({
      where: { toUserId: userId },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalRatings'],
      ],
    });

    if (ratingData && ratingData.dataValues.totalRatings > 0) {
      const avgRating = parseFloat(ratingData.dataValues.avgRating).toFixed(1);
      const totalRides = parseInt(ratingData.dataValues.totalRatings);
      
      await User.update(
        { 
          rating: avgRating,
          totalRides: totalRides,
        },
        { where: { id: userId } }
      );
    }
  } catch (error) {
    console.error('Update user rating error:', error);
  }
};

const getRatingsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type } = req.query;

    let whereClause = { toUserId: userId };
    
    if (type === 'driver') {
      whereClause.isDriverRating = true;
    } else if (type === 'rider') {
      whereClause.isDriverRating = false;
    }

    const offset = (page - 1) * limit;

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Ride,
          as: 'ride',
          attributes: ['id', 'pickupAddress', 'destinationAddress', 'completedAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Calculate rating statistics
    const stats = await Rating.findOne({
      where: { toUserId: userId },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalRatings'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN rating = 5 THEN 1 END')), 'fiveStars'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN rating = 4 THEN 1 END')), 'fourStars'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN rating = 3 THEN 1 END')), 'threeStars'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN rating = 2 THEN 1 END')), 'twoStars'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN rating = 1 THEN 1 END')), 'oneStar'],
      ],
    });

    res.json({
      success: true,
      data: {
        ratings,
        stats: stats.dataValues,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getRatingForRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    // Check if user is part of this ride
    const ride = await Ride.findByPk(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (ride.riderId !== userId && ride.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view ratings for this ride',
      });
    }

    const ratings = await Rating.findAll({
      where: { rideId },
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.json({
      success: true,
      data: { ratings },
    });
  } catch (error) {
    console.error('Get rating for ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, comment, categories } = req.body;
    const userId = req.user.id;

    const existingRating = await Rating.findByPk(ratingId);

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }

    // Check if user owns this rating
    if (existingRating.fromUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this rating',
      });
    }

    // Check if rating is not too old (allow updates within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (existingRating.createdAt < twentyFourHoursAgo) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update ratings older than 24 hours',
      });
    }

    await existingRating.update({
      rating,
      comment,
      categories,
    });

    // Update user's average rating
    await updateUserRating(existingRating.toUserId);

    // Clear user cache
    await deleteFromCache(`user:${existingRating.toUserId}`);

    res.json({
      success: true,
      message: 'Rating updated successfully',
      data: { rating: existingRating },
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findByPk(ratingId);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }

    // Check if user owns this rating or is admin
    if (rating.fromUserId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this rating',
      });
    }

    const toUserId = rating.toUserId;

    await rating.destroy();

    // Update user's average rating
    await updateUserRating(toUserId);

    // Clear user cache
    await deleteFromCache(`user:${toUserId}`);

    res.json({
      success: true,
      message: 'Rating deleted successfully',
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createRating,
  getRatingsForUser,
  getRatingForRide,
  updateRating,
  deleteRating,
};