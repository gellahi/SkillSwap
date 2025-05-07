import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import middleware
import { errorHandler, notFound, logger } from '../../../shared/middlewares/index.js';

// Import database connection
import { connectToMongoDB } from '../../../shared/db-connection/mongodb.js';

// Import routes
import routes from './routes/index.js';

// Create Express app
const app = express();

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
app.use('/api/projects', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SkillSwap Projects Service',
    version: '1.0.0',
    endpoints: [
      '/api/projects',
      '/api/projects/:id',
      '/api/projects/client/:clientId',
      '/api/projects/categories'
    ]
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

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
    
    // Start server
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      logger.info(`Projects service running in ${process.env.NODE_ENV} mode on port ${PORT}`);
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

export default app;
