const User = require('./User');
const Driver = require('./Driver');
const Ride = require('./Ride');
const Payment = require('./Payment');
const Rating = require('./Rating');

// Define associations
User.hasOne(Driver, { foreignKey: 'userId', as: 'driverProfile' });
Driver.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Ride, { foreignKey: 'riderId', as: 'ridesAsRider' });
User.hasMany(Ride, { foreignKey: 'driverId', as: 'ridesAsDriver' });

Ride.belongsTo(User, { foreignKey: 'riderId', as: 'rider' });
Ride.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

Ride.hasOne(Payment, { foreignKey: 'rideId', as: 'payment' });
Payment.belongsTo(Ride, { foreignKey: 'rideId', as: 'ride' });

Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });

Ride.hasMany(Rating, { foreignKey: 'rideId', as: 'ratings' });
Rating.belongsTo(Ride, { foreignKey: 'rideId', as: 'ride' });

User.hasMany(Rating, { foreignKey: 'fromUserId', as: 'ratingsGiven' });
User.hasMany(Rating, { foreignKey: 'toUserId', as: 'ratingsReceived' });

Rating.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
Rating.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });

module.exports = {
  User,
  Driver,
  Ride,
  Payment,
  Rating,
};