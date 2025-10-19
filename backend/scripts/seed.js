const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const { User, Driver, Ride, Payment, Rating } = require('../src/models');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Clear existing data (development only)
    if (process.env.NODE_ENV !== 'production') {
      await Rating.destroy({ where: {} });
      await Payment.destroy({ where: {} });
      await Ride.destroy({ where: {} });
      await Driver.destroy({ where: {} });
      await User.destroy({ where: {} });
      console.log('Cleared existing data.');
    }

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@rideshare.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+1234567890',
      role: 'admin',
      isVerified: true,
      rating: 5.0,
    });
    console.log('Created admin user.');

    // Create sample riders
    const riders = await User.bulkCreate([
      {
        email: 'john.doe@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567891',
        role: 'rider',
        isVerified: true,
        rating: 4.8,
        totalRides: 25,
      },
      {
        email: 'jane.smith@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1234567892',
        role: 'rider',
        isVerified: true,
        rating: 4.9,
        totalRides: 18,
      },
      {
        email: 'mike.johnson@example.com',
        password: 'password123',
        firstName: 'Mike',
        lastName: 'Johnson',
        phoneNumber: '+1234567893',
        role: 'rider',
        isVerified: true,
        rating: 4.7,
        totalRides: 12,
      },
    ]);
    console.log('Created sample riders.');

    // Create sample drivers
    const drivers = await User.bulkCreate([
      {
        email: 'driver1@example.com',
        password: 'password123',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        phoneNumber: '+1234567894',
        role: 'driver',
        isVerified: true,
        rating: 4.9,
        totalRides: 150,
      },
      {
        email: 'driver2@example.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Wilson',
        phoneNumber: '+1234567895',
        role: 'driver',
        isVerified: true,
        rating: 4.8,
        totalRides: 203,
      },
      {
        email: 'driver3@example.com',
        password: 'password123',
        firstName: 'David',
        lastName: 'Brown',
        phoneNumber: '+1234567896',
        role: 'driver',
        isVerified: true,
        rating: 4.7,
        totalRides: 89,
      },
    ]);
    console.log('Created sample drivers.');

    // Create driver profiles
    const driverProfiles = await Driver.bulkCreate([
      {
        userId: drivers[0].id,
        licenseNumber: 'DL123456789',
        licenseExpiry: new Date('2025-12-31'),
        vehicleModel: 'Toyota Camry',
        vehicleYear: 2020,
        vehicleColor: 'Silver',
        licensePlate: 'ABC123',
        vehicleType: 'economy',
        isApproved: true,
        isOnline: true,
        currentLat: 40.7589,
        currentLng: -73.9851,
        totalEarnings: 2850.75,
        documentsVerified: true,
        backgroundCheckStatus: 'approved',
      },
      {
        userId: drivers[1].id,
        licenseNumber: 'DL987654321',
        licenseExpiry: new Date('2026-06-30'),
        vehicleModel: 'Honda Accord',
        vehicleYear: 2021,
        vehicleColor: 'Black',
        licensePlate: 'XYZ789',
        vehicleType: 'comfort',
        isApproved: true,
        isOnline: true,
        currentLat: 40.7505,
        currentLng: -73.9934,
        totalEarnings: 4120.30,
        documentsVerified: true,
        backgroundCheckStatus: 'approved',
      },
      {
        userId: drivers[2].id,
        licenseNumber: 'DL456789123',
        licenseExpiry: new Date('2025-09-15'),
        vehicleModel: 'BMW 3 Series',
        vehicleYear: 2022,
        vehicleColor: 'White',
        licensePlate: 'BMW456',
        vehicleType: 'premium',
        isApproved: true,
        isOnline: false,
        currentLat: 40.7282,
        currentLng: -74.0776,
        totalEarnings: 1895.60,
        documentsVerified: true,
        backgroundCheckStatus: 'approved',
      },
    ]);
    console.log('Created driver profiles.');

    // Create sample rides
    const rides = await Ride.bulkCreate([
      {
        riderId: riders[0].id,
        driverId: drivers[0].id,
        status: 'completed',
        pickupLat: 40.7589,
        pickupLng: -73.9851,
        pickupAddress: '123 Main St, New York, NY 10001',
        destinationLat: 40.7505,
        destinationLng: -73.9934,
        destinationAddress: '456 Broadway, New York, NY 10013',
        estimatedDistance: 2.3,
        estimatedDuration: 12,
        actualDistance: 2.5,
        actualDuration: 15,
        baseFare: 2.50,
        distanceFare: 3.00,
        timeFare: 2.25,
        totalFare: 7.75,
        paymentStatus: 'completed',
        vehicleType: 'economy',
        requestedAt: new Date('2024-01-15T10:30:00Z'),
        acceptedAt: new Date('2024-01-15T10:31:00Z'),
        arrivedAt: new Date('2024-01-15T10:38:00Z'),
        startedAt: new Date('2024-01-15T10:40:00Z'),
        completedAt: new Date('2024-01-15T10:55:00Z'),
      },
      {
        riderId: riders[1].id,
        driverId: drivers[1].id,
        status: 'completed',
        pickupLat: 40.7282,
        pickupLng: -74.0776,
        pickupAddress: '789 Wall St, New York, NY 10005',
        destinationLat: 40.7831,
        destinationLng: -73.9712,
        destinationAddress: '321 Central Park West, New York, NY 10025',
        estimatedDistance: 5.2,
        estimatedDuration: 25,
        actualDistance: 5.8,
        actualDuration: 28,
        baseFare: 3.50,
        distanceFare: 10.44,
        timeFare: 5.60,
        totalFare: 19.54,
        paymentStatus: 'completed',
        vehicleType: 'comfort',
        requestedAt: new Date('2024-01-15T14:20:00Z'),
        acceptedAt: new Date('2024-01-15T14:22:00Z'),
        arrivedAt: new Date('2024-01-15T14:30:00Z'),
        startedAt: new Date('2024-01-15T14:32:00Z'),
        completedAt: new Date('2024-01-15T15:00:00Z'),
      },
    ]);
    console.log('Created sample rides.');

    // Create sample payments
    const payments = await Payment.bulkCreate([
      {
        rideId: rides[0].id,
        userId: riders[0].id,
        amount: 9.75,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'completed',
        tip: 2.00,
        platformFee: 1.95,
        driverEarnings: 7.80,
        paymentDate: new Date('2024-01-15T10:55:00Z'),
      },
      {
        rideId: rides[1].id,
        userId: riders[1].id,
        amount: 23.54,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'completed',
        tip: 4.00,
        platformFee: 4.71,
        driverEarnings: 18.83,
        paymentDate: new Date('2024-01-15T15:00:00Z'),
      },
    ]);
    console.log('Created sample payments.');

    // Create sample ratings
    const ratings = await Rating.bulkCreate([
      {
        rideId: rides[0].id,
        fromUserId: riders[0].id,
        toUserId: drivers[0].id,
        rating: 5,
        comment: 'Great driver! Very professional and safe.',
        categories: { cleanliness: 5, punctuality: 5, communication: 5 },
        isDriverRating: true,
      },
      {
        rideId: rides[0].id,
        fromUserId: drivers[0].id,
        toUserId: riders[0].id,
        rating: 5,
        comment: 'Excellent passenger, very polite.',
        categories: { politeness: 5, punctuality: 5 },
        isDriverRating: false,
      },
      {
        rideId: rides[1].id,
        fromUserId: riders[1].id,
        toUserId: drivers[1].id,
        rating: 4,
        comment: 'Good ride, but could be faster.',
        categories: { cleanliness: 5, punctuality: 3, communication: 4 },
        isDriverRating: true,
      },
      {
        rideId: rides[1].id,
        fromUserId: drivers[1].id,
        toUserId: riders[1].id,
        rating: 5,
        comment: 'Nice passenger!',
        categories: { politeness: 5, punctuality: 5 },
        isDriverRating: false,
      },
    ]);
    console.log('Created sample ratings.');

    console.log('Database seeding completed successfully!');
    console.log('Sample accounts created:');
    console.log('Admin: admin@rideshare.com / admin123');
    console.log('Rider: john.doe@example.com / password123');
    console.log('Driver: driver1@example.com / password123');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();