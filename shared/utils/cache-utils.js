import { getRedisClient } from '../db-connection/redis.js';

/**
 * Cache utility for Redis
 */
class CacheService {
  constructor(options = {}) {
    this.client = getRedisClient(options);
    this.defaultTTL = options.ttl || process.env.REDIS_CACHE_TTL || 3600; // Default TTL: 1 hour
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<string>} - Redis response
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        return await this.client.set(key, stringValue, 'EX', ttl);
      } else {
        return await this.client.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Parsed value or null if not found
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key from the cache
   * @param {string} key - Cache key
   * @returns {Promise<number>} - Number of keys removed
   */
  async del(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists in the cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - True if key exists
   */
  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking if cache key ${key} exists:`, error);
      return false;
    }
  }

  /**
   * Set multiple values in the cache
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<string>} - Redis response
   */
  async mset(keyValuePairs, ttl = this.defaultTTL) {
    try {
      const pipeline = this.client.pipeline();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const stringValue = JSON.stringify(value);
        if (ttl) {
          pipeline.set(key, stringValue, 'EX', ttl);
        } else {
          pipeline.set(key, stringValue);
        }
      });
      
      return await pipeline.exec();
    } catch (error) {
      console.error('Error setting multiple cache keys:', error);
      throw error;
    }
  }

  /**
   * Get multiple values from the cache
   * @param {Array<string>} keys - Array of cache keys
   * @returns {Promise<Object>} - Object with key-value pairs
   */
  async mget(keys) {
    try {
      const values = await this.client.mget(keys);
      const result = {};
      
      keys.forEach((key, index) => {
        if (values[index]) {
          result[key] = JSON.parse(values[index]);
        } else {
          result[key] = null;
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error getting multiple cache keys:', error);
      return {};
    }
  }

  /**
   * Clear all keys with a specific prefix
   * @param {string} prefix - Key prefix
   * @returns {Promise<number>} - Number of keys removed
   */
  async clearByPrefix(prefix) {
    try {
      const keys = await this.client.keys(`${prefix}*`);
      if (keys.length > 0) {
        return await this.client.del(keys);
      }
      return 0;
    } catch (error) {
      console.error(`Error clearing cache keys with prefix ${prefix}:`, error);
      throw error;
    }
  }

  /**
   * Clear all keys
   * @returns {Promise<string>} - Redis response
   */
  async flushAll() {
    try {
      return await this.client.flushall();
    } catch (error) {
      console.error('Error flushing cache:', error);
      throw error;
    }
  }
}

export default CacheService;
