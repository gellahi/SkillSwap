import rateLimit from 'express-rate-limit';
import { createRedisClient } from '../db-connection/redis.js';
import { ApiError } from './error-handler.js';

/**
 * Create a Redis store for rate limiting
 * @returns {Object} Redis store for rate limiting
 */
const createRedisStore = () => {
  const redisClient = createRedisClient();
  
  return {
    // Increment key and set expiry
    async increment(key) {
      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, 60); // 60 seconds expiry
      }
      return current;
    },
    // Decrement key
    async decrement(key) {
      return await redisClient.decr(key);
    },
    // Reset key
    async resetKey(key) {
      return await redisClient.del(key);
    }
  };
};

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // 100 requests per minute
    message = 'Too many requests, please try again later.',
    standardHeaders = true,
    legacyHeaders = false,
    keyGenerator = (req) => req.ip,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      status: 429,
      message
    },
    standardHeaders,
    legacyHeaders,
    keyGenerator,
    store: createRedisStore()
  });
};

/**
 * Default rate limiters for different routes
 */
export const defaultLimiters = {
  // General API limiter
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // 100 requests per minute
  }),
  
  // Auth routes limiter (more strict)
  auth: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many authentication attempts, please try again later.'
  }),
  
  // User routes limiter
  user: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30 // 30 requests per minute
  })
};

export default {
  createRateLimiter,
  defaultLimiters
};
