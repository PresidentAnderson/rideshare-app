const { RateLimiterMemory } = require('rate-limiter-flexible');

// General API rate limiter
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900, // Per 15 minutes by default
});

// Strict rate limiter for auth endpoints
const authRateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 900, // Per 15 minutes
});

// Rate limiter for ride requests
const rideRequestLimiter = new RateLimiterMemory({
  points: 10, // 10 ride requests
  duration: 3600, // Per hour
});

// Generic rate limiting middleware
const createRateLimitMiddleware = (limiter, message = 'Too many requests') => {
  return async (req, res, next) => {
    try {
      const key = req.ip;
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const remainingPoints = rejRes.remainingPoints || 0;
      const msBeforeNext = rejRes.msBeforeNext || 1000;
      
      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': limiter.points,
        'X-RateLimit-Remaining': remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString()
      });

      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.round(msBeforeNext / 1000)
      });
    }
  };
};

module.exports = {
  rateLimiter: createRateLimitMiddleware(rateLimiter),
  authRateLimiter: createRateLimitMiddleware(authRateLimiter, 'Too many authentication attempts'),
  rideRequestLimiter: createRateLimitMiddleware(rideRequestLimiter, 'Too many ride requests'),
  createRateLimitMiddleware
};