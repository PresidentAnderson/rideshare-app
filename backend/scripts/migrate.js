const { sequelize } = require('../src/config/database');
require('../src/models'); // Import all models to register associations

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('Database migrations completed successfully.');

    // Close connection
    await sequelize.close();
    console.log('Database connection closed.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();