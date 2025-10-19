const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ride = sequelize.define('Ride', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  riderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM(
      'requested',
      'accepted',
      'driver_arrived',
      'in_progress',
      'completed',
      'cancelled_by_rider',
      'cancelled_by_driver'
    ),
    allowNull: false,
    defaultValue: 'requested',
  },
  pickupLat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  pickupLng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  pickupAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  destinationLat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  destinationLng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  destinationAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  estimatedDistance: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true, // km
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true, // minutes
  },
  actualDistance: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  actualDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  baseFare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  distanceFare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  timeFare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  totalFare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  vehicleType: {
    type: DataTypes.ENUM('economy', 'comfort', 'premium', 'xl'),
    allowNull: false,
    defaultValue: 'economy',
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  arrivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'rides',
  indexes: [
    {
      fields: ['rider_id'],
    },
    {
      fields: ['driver_id'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['requested_at'],
    },
  ],
});

module.exports = Ride;