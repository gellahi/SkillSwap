import mongoose from 'mongoose';
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
    new winston.transports.File({ filename: 'logs/mongodb.log' })
  ]
});

// MongoDB connection options
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Connect to MongoDB
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
export const connectToMongoDB = async (uri) => {
  if (!uri) {
    throw new Error('MongoDB URI is required');
  }

  try {
    await mongoose.connect(uri, options);

    // Get the default connection
    const db = mongoose.connection;

    // Set up event listeners
    db.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
      throw new Error(`MongoDB connection error: ${err}`);
    });

    db.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    db.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

    logger.info('MongoDB connected successfully');
    return db;
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};

/**
 * Close MongoDB connection
 * @returns {Promise<void>}
 */
export const closeMongoDBConnection = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed successfully');
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
    throw error;
  }
};

export default {
  connectToMongoDB,
  closeMongoDBConnection
};
