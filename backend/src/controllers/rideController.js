const { Ride, User, Driver } = require('../models');
const { Op } = require('sequelize');
const { setToCache, getFromCache } = require('../config/redis');

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Helper function to calculate fare
const calculateFare = (distance, duration, vehicleType) => {
  const baseRates = {
    economy: { base: 2.50, perKm: 1.20, perMin: 0.15 },
    comfort: { base: 3.50, perKm: 1.80, perMin: 0.20 },
    premium: { base: 5.00, perKm: 2.50, perMin: 0.30 },
    xl: { base: 4.00, perKm: 2.00, perMin: 0.25 },
  };

  const rates = baseRates[vehicleType] || baseRates.economy;
  
  const baseFare = rates.base;
  const distanceFare = distance * rates.perKm;
  const timeFare = duration * rates.perMin;
  const totalFare = baseFare + distanceFare + timeFare;

  return {
    baseFare: parseFloat(baseFare.toFixed(2)),
    distanceFare: parseFloat(distanceFare.toFixed(2)),
    timeFare: parseFloat(timeFare.toFixed(2)),
    totalFare: parseFloat(totalFare.toFixed(2)),
  };
};

const requestRide = async (req, res) => {
  try {
    const {
      pickupLat,
      pickupLng,
      pickupAddress,
      destinationLat,
      destinationLng,
      destinationAddress,
      vehicleType,
      specialRequests,
    } = req.body;

    const riderId = req.user.id;

    // Check if user has any active rides
    const activeRide = await Ride.findOne({
      where: {
        riderId,
        status: ['requested', 'accepted', 'driver_arrived', 'in_progress'],
      },
    });

    if (activeRide) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active ride',
      });
    }

    // Calculate estimated distance and duration
    const estimatedDistance = calculateDistance(pickupLat, pickupLng, destinationLat, destinationLng);
    const estimatedDuration = Math.round(estimatedDistance * 2.5); // Rough estimate: 2.5 min per km

    // Calculate fare
    const fareCalculation = calculateFare(estimatedDistance, estimatedDuration, vehicleType);

    // Create ride request
    const ride = await Ride.create({
      riderId,
      pickupLat,
      pickupLng,
      pickupAddress,
      destinationLat,
      destinationLng,
      destinationAddress,
      vehicleType: vehicleType || 'economy',
      specialRequests,
      estimatedDistance,
      estimatedDuration,
      ...fareCalculation,
      status: 'requested',
      requestedAt: new Date(),
    });

    // Cache ride for quick access
    await setToCache(`ride:${ride.id}`, ride.toJSON(), 1800); // 30 minutes

    // Emit ride request to nearby drivers via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('drivers').emit('new_ride_request', {
        rideId: ride.id,
        pickup: { lat: pickupLat, lng: pickupLng, address: pickupAddress },
        destination: { lat: destinationLat, lng: destinationLng, address: destinationAddress },
        vehicleType,
        estimatedFare: fareCalculation.totalFare,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ride requested successfully',
      data: { ride },
    });
  } catch (error) {
    console.error('Request ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    // Check if driver exists and is approved
    const driver = await Driver.findOne({ where: { userId: driverId } });
    if (!driver || !driver.isApproved || !driver.isOnline) {
      return res.status(403).json({
        success: false,
        message: 'Driver is not approved or not online',
      });
    }

    // Check if driver has any active rides
    const activeRide = await Ride.findOne({
      where: {
        driverId,
        status: ['accepted', 'driver_arrived', 'in_progress'],
      },
    });

    if (activeRide) {
      return res.status(400).json({
        success: false,
        message: 'Driver already has an active ride',
      });
    }

    // Find the ride and check if it's still available
    const ride = await Ride.findOne({
      where: {
        id: rideId,
        status: 'requested',
      },
      include: [
        {
          model: User,
          as: 'rider',
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
        },
      ],
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found or already accepted',
      });
    }

    // Accept the ride
    await ride.update({
      driverId,
      status: 'accepted',
      acceptedAt: new Date(),
    });

    // Set driver offline temporarily
    await driver.update({ isOnline: false });

    // Update cache
    await setToCache(`ride:${ride.id}`, ride.toJSON(), 1800);

    // Emit ride accepted to rider
    const io = req.app.get('io');
    if (io) {
      io.to(`rider_${ride.riderId}`).emit('ride_accepted', {
        rideId: ride.id,
        driver: {
          id: req.user.id,
          name: `${req.user.firstName} ${req.user.lastName}`,
          phone: req.user.phoneNumber,
          rating: req.user.rating,
          vehicle: {
            model: driver.vehicleModel,
            color: driver.vehicleColor,
            licensePlate: driver.licensePlate,
          },
        },
      });
    }

    res.json({
      success: true,
      message: 'Ride accepted successfully',
      data: { ride },
    });
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const ride = await Ride.findByPk(rideId, {
      include: [
        {
          model: User,
          as: 'rider',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Check if user is authorized to update this ride
    if (ride.riderId !== userId && ride.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ride',
      });
    }

    const updateData = { status };

    // Set timestamps based on status
    switch (status) {
      case 'driver_arrived':
        updateData.arrivedAt = new Date();
        break;
      case 'in_progress':
        updateData.startedAt = new Date();
        break;
      case 'completed':
        updateData.completedAt = new Date();
        // Set driver back online
        if (ride.driverId) {
          await Driver.update({ isOnline: true }, { where: { userId: ride.driverId } });
        }
        break;
      case 'cancelled_by_rider':
      case 'cancelled_by_driver':
        updateData.cancelledAt = new Date();
        // Set driver back online if cancelled
        if (ride.driverId) {
          await Driver.update({ isOnline: true }, { where: { userId: ride.driverId } });
        }
        break;
    }

    await ride.update(updateData);

    // Update cache
    await setToCache(`ride:${ride.id}`, ride.toJSON(), 1800);

    // Emit status update
    const io = req.app.get('io');
    if (io) {
      io.to(`ride_${ride.id}`).emit('ride_status_updated', {
        rideId: ride.id,
        status,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Ride status updated successfully',
      data: { ride },
    });
  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getRideHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const whereClause = {
      [Op.or]: [
        { riderId: userId },
        { driverId: userId },
      ],
    };

    if (status) {
      whereClause.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: rides } = await Ride.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'rider',
          attributes: ['id', 'firstName', 'lastName', 'rating'],
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'rating'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        rides,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get ride history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getRideDetails = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    const ride = await Ride.findByPk(rideId, {
      include: [
        {
          model: User,
          as: 'rider',
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'rating'],
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'rating'],
        },
      ],
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Check if user is authorized to view this ride
    if (ride.riderId !== userId && ride.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ride',
      });
    }

    res.json({
      success: true,
      data: { ride },
    });
  } catch (error) {
    console.error('Get ride details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const ride = await Ride.findByPk(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Check if user is authorized to cancel this ride
    if (ride.riderId !== userId && ride.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ride',
      });
    }

    // Check if ride can be cancelled
    if (!['requested', 'accepted', 'driver_arrived'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: 'Ride cannot be cancelled at this stage',
      });
    }

    const cancelStatus = ride.riderId === userId ? 'cancelled_by_rider' : 'cancelled_by_driver';

    await ride.update({
      status: cancelStatus,
      cancelledAt: new Date(),
      cancellationReason: reason,
    });

    // Set driver back online if they had accepted the ride
    if (ride.driverId) {
      await Driver.update({ isOnline: true }, { where: { userId: ride.driverId } });
    }

    // Update cache
    await setToCache(`ride:${ride.id}`, ride.toJSON(), 1800);

    // Emit cancellation
    const io = req.app.get('io');
    if (io) {
      io.to(`ride_${ride.id}`).emit('ride_cancelled', {
        rideId: ride.id,
        cancelledBy: ride.riderId === userId ? 'rider' : 'driver',
        reason,
      });
    }

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      data: { ride },
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  requestRide,
  acceptRide,
  updateRideStatus,
  getRideHistory,
  getRideDetails,
  cancelRide,
};