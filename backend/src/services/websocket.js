const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Driver } = require('../models');

const initializeWebSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.WEB_URL] 
        : ["http://localhost:3001", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected with role ${socket.userRole}`);

    // Join user-specific room
    socket.join(`user_${socket.userId}`);

    // Join role-specific rooms
    if (socket.userRole === 'driver') {
      socket.join('drivers');
    } else if (socket.userRole === 'rider') {
      socket.join('riders');
    }

    // Handle driver going online/offline
    socket.on('driver_status_change', async (data) => {
      if (socket.userRole !== 'driver') return;

      try {
        const driver = await Driver.findOne({ where: { userId: socket.userId } });
        if (driver) {
          await driver.update({ isOnline: data.isOnline });
          
          if (data.isOnline) {
            socket.join('online_drivers');
          } else {
            socket.leave('online_drivers');
          }

          socket.broadcast.emit('driver_status_updated', {
            driverId: driver.id,
            isOnline: data.isOnline,
          });
        }
      } catch (error) {
        console.error('Driver status change error:', error);
      }
    });

    // Handle driver location updates
    socket.on('driver_location_update', async (data) => {
      if (socket.userRole !== 'driver') return;

      try {
        const driver = await Driver.findOne({ where: { userId: socket.userId } });
        if (driver && driver.isOnline) {
          await driver.update({
            currentLat: data.lat,
            currentLng: data.lng,
          });

          // Broadcast location to riders requesting rides
          socket.to('riders').emit('driver_location_updated', {
            driverId: driver.id,
            location: { lat: data.lat, lng: data.lng },
          });
        }
      } catch (error) {
        console.error('Driver location update error:', error);
      }
    });

    // Handle joining ride-specific rooms
    socket.on('join_ride', (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`User ${socket.userId} joined ride room: ride_${rideId}`);
    });

    // Handle leaving ride-specific rooms
    socket.on('leave_ride', (rideId) => {
      socket.leave(`ride_${rideId}`);
      console.log(`User ${socket.userId} left ride room: ride_${rideId}`);
    });

    // Handle ride status updates
    socket.on('ride_status_update', (data) => {
      socket.to(`ride_${data.rideId}`).emit('ride_status_updated', {
        rideId: data.rideId,
        status: data.status,
        timestamp: new Date(),
        updatedBy: socket.userId,
      });
    });

    // Handle driver arrival notifications
    socket.on('driver_arrived', (data) => {
      socket.to(`ride_${data.rideId}`).emit('driver_arrived', {
        rideId: data.rideId,
        driverId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Handle ride completion
    socket.on('ride_completed', (data) => {
      socket.to(`ride_${data.rideId}`).emit('ride_completed', {
        rideId: data.rideId,
        completedAt: new Date(),
        totalFare: data.totalFare,
      });
    });

    // Handle real-time messaging
    socket.on('send_message', (data) => {
      socket.to(`ride_${data.rideId}`).emit('new_message', {
        rideId: data.rideId,
        fromUserId: socket.userId,
        message: data.message,
        timestamp: new Date(),
      });
    });

    // Handle emergency situations
    socket.on('emergency', (data) => {
      // Notify all admins and emergency services
      socket.to('admins').emit('emergency_alert', {
        userId: socket.userId,
        rideId: data.rideId,
        location: data.location,
        message: data.message,
        timestamp: new Date(),
      });

      console.log(`EMERGENCY ALERT from user ${socket.userId}:`, data);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected`);

      // If driver disconnects, set them offline after a delay
      if (socket.userRole === 'driver') {
        setTimeout(async () => {
          try {
            const driver = await Driver.findOne({ where: { userId: socket.userId } });
            if (driver) {
              await driver.update({ isOnline: false });
              socket.broadcast.emit('driver_status_updated', {
                driverId: driver.id,
                isOnline: false,
              });
            }
          } catch (error) {
            console.error('Driver offline update error:', error);
          }
        }, 30000); // 30 seconds delay
      }
    });

    // Send initial connection confirmation
    socket.emit('connected', {
      message: 'Successfully connected to ridesharing service',
      userId: socket.userId,
      role: socket.userRole,
    });
  });

  // Utility functions for emitting events from controllers
  io.emitToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  io.emitToRide = (rideId, event, data) => {
    io.to(`ride_${rideId}`).emit(event, data);
  };

  io.emitToDrivers = (event, data) => {
    io.to('drivers').emit(event, data);
  };

  io.emitToRiders = (event, data) => {
    io.to('riders').emit(event, data);
  };

  return io;
};

module.exports = { initializeWebSocket };