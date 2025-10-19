const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  licenseExpiry: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  vehicleModel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicleYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2010,
      max: new Date().getFullYear() + 1,
    },
  },
  vehicleColor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  licensePlate: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  vehicleType: {
    type: DataTypes.ENUM('economy', 'comfort', 'premium', 'xl'),
    allowNull: false,
    defaultValue: 'economy',
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  currentLat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  currentLng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  totalEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  documentsVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  backgroundCheckStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'drivers',
});

module.exports = Driver;