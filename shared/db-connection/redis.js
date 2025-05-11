import Redis from 'ioredis';
import winston from 'winston';

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/redis.log' })
  ]
});

let redisClient = null;

/**
 * Create a Redis client
 * @param {Object} options - Redis connection options
 * @returns {Redis} Redis client
 */
export const createRedisClient = (options = {}) => {
  const {
    host = process.env.REDIS_HOST || 'localhost',
    port = process.env.REDIS_PORT || 6379,
    password = process.env.REDIS_PASSWORD || '',
    db = process.env.REDIS_DB || 0,
    keyPrefix = process.env.REDIS_PREFIX || '',
  } = options;

  const config = {
    host,
    port,
    db,
    keyPrefix,
  };

  // Add password only if it exists
  if (password) {
    config.password = password;
  }

  try {
    const client = new Redis(config);

    // Set up event listeners
    client.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    client.on('error', (err) => {
      logger.error(`Redis connection error: ${err}`);
    });

    client.on('close', () => {
      logger.warn('Redis connection closed');
    });

    client.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

    return client;
  } catch (error) {
    logger.error(`Failed to create Redis client: ${error.message}`);
    throw error;
  }
};

/**
 * Get the Redis client instance
 * @param {Object} options - Redis connection options
 * @returns {Redis} Redis client
 */
export const getRedisClient = (options = {}) => {
  if (!redisClient) {
    redisClient = createRedisClient(options);
  }
  return redisClient;
};

/**
 * Close the Redis connection
 * @returns {Promise<void>}
 */
export const closeRedisConnection = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed successfully');
      redisClient = null;
    } catch (error) {
      logger.error(`Error closing Redis connection: ${error.message}`);
      throw error;
    }
  }
};

export default {
  createRedisClient,
  getRedisClient,
  closeRedisConnection
};
