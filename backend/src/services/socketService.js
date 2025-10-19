const logger = require('../utils/logger');

let io = null;

/**
 * Initialize Socket.IO service
 */
const initializeSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle user authentication and room joining
    socket.on('authenticate', (data) => {
      try {
        const { userId, role } = data;
        
        // Join user-specific room
        socket.join(`user_${userId}`);
        
        // Join role-specific room
        if (role === 'driver') {
          socket.join('drivers');
        } else if (role === 'rider') {
          socket.join('riders');
        }

        socket.userId = userId;
        socket.userRole = role;

        logger.info(`User ${userId} (${role}) authenticated and joined rooms`);
        
        socket.emit('authenticated', {
          success: true,
          message: 'Successfully authenticated'
        });
      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.emit('auth_error', {
          success: false,
          message: 'Authentication failed'
        });
      }
    });

    // Handle driver location updates
    socket.on('driver_location_update', (data) => {
      try {
        if (socket.userRole !== 'driver') {
          return;
        }

        const { latitude, longitude, heading, speed } = data;
        
        // Broadcast location to relevant riders (those with active rides with this driver)
        socket.broadcast.emit('driver_location', {
          driverId: socket.userId,
          location: { latitude, longitude, heading, speed },
          timestamp: new Date().toISOString()
        });

        logger.debug(`Driver ${socket.userId} location updated`);
      } catch (error) {
        logger.error('Driver location update error:', error);
      }
    });

    // Handle ride-related events
    socket.on('join_ride', (rideId) => {
      try {
        socket.join(`ride_${rideId}`);
        logger.info(`User ${socket.userId} joined ride room: ${rideId}`);
      } catch (error) {
        logger.error('Join ride room error:', error);
      }
    });

    socket.on('leave_ride', (rideId) => {
      try {
        socket.leave(`ride_${rideId}`);
        logger.info(`User ${socket.userId} left ride room: ${rideId}`);
      } catch (error) {
        logger.error('Leave ride room error:', error);
      }
    });

    // Handle messages
    socket.on('send_message', (data) => {
      try {
        const { rideId, message, receiverId } = data;
        
        // Emit message to specific user and ride room
        socket.to(`user_${receiverId}`).emit('new_message', {
          rideId,
          senderId: socket.userId,
          message,
          timestamp: new Date().toISOString()
        });

        socket.to(`ride_${rideId}`).emit('new_message', {
          rideId,
          senderId: socket.userId,
          message,
          timestamp: new Date().toISOString()
        });

        logger.info(`Message sent from ${socket.userId} to ${receiverId} in ride ${rideId}`);
      } catch (error) {
        logger.error('Send message error:', error);
      }
    });

    // Handle ride status updates for real-time notifications
    socket.on('ride_status_update', (data) => {
      try {
        const { rideId, status, riderId, driverId } = data;
        
        // Notify all parties in the ride
        io.to(`ride_${rideId}`).emit('ride_status_changed', {
          rideId,
          status,
          timestamp: new Date().toISOString()
        });

        logger.info(`Ride ${rideId} status updated to: ${status}`);
      } catch (error) {
        logger.error('Ride status update error:', error);
      }
    });

    // Handle driver availability changes
    socket.on('driver_status_change', (data) => {
      try {
        if (socket.userRole !== 'driver') {
          return;
        }

        const { status } = data;
        
        // Broadcast to admin dashboard or other interested parties
        socket.broadcast.to('admin').emit('driver_status_changed', {
          driverId: socket.userId,
          status,
          timestamp: new Date().toISOString()
        });

        logger.info(`Driver ${socket.userId} status changed to: ${status}`);
      } catch (error) {
        logger.error('Driver status change error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id} (User: ${socket.userId})`);
      
      // If it's a driver, notify that they're offline
      if (socket.userRole === 'driver' && socket.userId) {
        socket.broadcast.to('admin').emit('driver_disconnected', {
          driverId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  logger.info('Socket.IO service initialized');
};

/**
 * Get Socket.IO instance
 */
const getSocket = () => {
  return io;
};

/**
 * Emit event to specific user
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

/**
 * Emit event to all drivers
 */
const emitToDrivers = (event, data) => {
  if (io) {
    io.to('drivers').emit(event, data);
  }
};

/**
 * Emit event to all riders
 */
const emitToRiders = (event, data) => {
  if (io) {
    io.to('riders').emit(event, data);
  }
};

/**
 * Emit event to specific ride room
 */
const emitToRide = (rideId, event, data) => {
  if (io) {
    io.to(`ride_${rideId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getSocket,
  emitToUser,
  emitToDrivers,
  emitToRiders,
  emitToRide
};