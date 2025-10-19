const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rideId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rides',
      key: 'id',
    },
  },
  fromUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  toUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  categories: {
    type: DataTypes.JSON,
    allowNull: true,
    // Example: { "cleanliness": 5, "punctuality": 4, "communication": 5 }
  },
  isDriverRating: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    // true if rating driver, false if rating rider
  },
}, {
  tableName: 'ratings',
  indexes: [
    {
      fields: ['ride_id'],
    },
    {
      fields: ['from_user_id'],
    },
    {
      fields: ['to_user_id'],
    },
    {
      unique: true,
      fields: ['ride_id', 'from_user_id', 'to_user_id'],
    },
  ],
});

module.exports = Rating;