const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'cash', 'wallet'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stripeChargeId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tip: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
    },
  },
  platformFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
    },
  },
  driverEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
    },
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refundDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'payments',
  indexes: [
    {
      fields: ['ride_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['payment_date'],
    },
    {
      fields: ['stripe_payment_intent_id'],
    },
  ],
});

module.exports = Payment;