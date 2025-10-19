const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }
    next();
  };
};

const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required(),
  role: Joi.string().valid('rider', 'driver').default('rider'),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const driverRegistrationSchema = Joi.object({
  licenseNumber: Joi.string().required(),
  licenseExpiry: Joi.date().greater('now').required(),
  vehicleModel: Joi.string().required(),
  vehicleYear: Joi.number().integer().min(2010).max(new Date().getFullYear() + 1).required(),
  vehicleColor: Joi.string().required(),
  licensePlate: Joi.string().required(),
  vehicleType: Joi.string().valid('economy', 'comfort', 'premium', 'xl').default('economy'),
});

const rideRequestSchema = Joi.object({
  pickupLat: Joi.number().min(-90).max(90).required(),
  pickupLng: Joi.number().min(-180).max(180).required(),
  pickupAddress: Joi.string().required(),
  destinationLat: Joi.number().min(-90).max(90).required(),
  destinationLng: Joi.number().min(-180).max(180).required(),
  destinationAddress: Joi.string().required(),
  vehicleType: Joi.string().valid('economy', 'comfort', 'premium', 'xl').default('economy'),
  specialRequests: Joi.string().allow('').optional(),
});

const ratingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  categories: Joi.object().pattern(
    Joi.string(),
    Joi.number().integer().min(1).max(5)
  ).optional(),
});

const paymentSchema = Joi.object({
  paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'cash', 'wallet').required(),
  tip: Joi.number().min(0).default(0),
});

const updateLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  profilePicture: Joi.string().uri().optional(),
});

module.exports = {
  validate,
  userRegistrationSchema,
  userLoginSchema,
  driverRegistrationSchema,
  rideRequestSchema,
  ratingSchema,
  paymentSchema,
  updateLocationSchema,
  updateProfileSchema,
};