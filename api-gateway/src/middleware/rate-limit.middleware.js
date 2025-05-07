import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} Rate limiter middleware
 */
export const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      success: false,
      message: 'Too many requests, please try again later.'
    },
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json(options.message);
    }
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  return rateLimit(mergedOptions);
};

/**
 * API rate limiter middleware
 */
export const apiLimiter = createRateLimiter();

/**
 * Auth rate limiter middleware (more strict)
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/signup requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

export default {
  createRateLimiter,
  apiLimiter,
  authLimiter
};
