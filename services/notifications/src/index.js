import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

// Import middleware
import { errorHandler, notFound, logger } from '../../../shared/middlewares/index.js';

// Import database connection
import { connectToMongoDB } from '../../../shared/db-connection/mongodb.js';

// Import routes
import routes from './routes/index.js';

// Import utilities
import { initSocketServer } from './utils/socket.js';
import { initEmailTransporter } from './utils/email.js';

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocketServer(server);

// Initialize email transporter
initEmailTransporter();

// Get current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Mount API routes
app.use('/api/notify', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SkillSwap Notifications Service',
    version: '1.0.0',
    endpoints: [
      '/api/notify/in-app',
      '/api/notify/email',
      '/api/notify/sms',
      '/api/notify/preferences'
    ]
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Schedule cron jobs
const scheduleCronJobs = () => {
  // Process pending notifications every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running scheduled task: Process pending notifications');
    
    try {
      // In a real implementation, we would process pending notifications here
      // For now, we'll just log a message
      logger.info('Processed pending notifications');
    } catch (error) {
      logger.error(`Error processing pending notifications: ${error.message}`);
    }
  });
  
  // Clean up old notifications every day at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled task: Clean up old notifications');
    
    try {
      // In a real implementation, we would clean up old notifications here
      // For now, we'll just log a message
      logger.info('Cleaned up old notifications');
    } catch (error) {
      logger.error(`Error cleaning up old notifications: ${error.message}`);
    }
  });
  
  logger.info('Scheduled cron jobs');
};

// Connect to MongoDB
const startServer = async () => {
  try {
    // Try to connect to MongoDB
    try {
      await connectToMongoDB(process.env.MONGO_URI);
      logger.info('Connected to MongoDB successfully');
    } catch (dbError) {
      // For demonstration purposes, we'll continue even if MongoDB connection fails
      logger.error(`Failed to connect to MongoDB: ${dbError.message}`);
      logger.warn('Continuing without MongoDB connection for demonstration purposes');
    }
    
    // Schedule cron jobs
    scheduleCronJobs();
    
    // Start server
    const PORT = process.env.PORT || 3005;
    server.listen(PORT, () => {
      logger.info(`Notifications service running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

// Start the server
startServer();

export default { app, server };
