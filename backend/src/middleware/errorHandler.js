const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${error.message}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack
  });

  // Supabase specific errors
  if (err.code === 'PGRST116') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error.message = message;
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    error.message = err.message;
    error.statusCode = 400;
  }

  // Rate limiting errors
  if (err.name === 'RateLimiterError') {
    error.message = 'Too many requests, please try again later';
    error.statusCode = 429;
  }

  // Duplicate key error
  if (err.code === '23505') {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File size too large';
    error.statusCode = 400;
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handle async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError
};