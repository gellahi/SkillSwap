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
import { errorHandler, notFound, logger } from './shared/middlewares/index.js';

// Create Express app
const app = express();

// Get current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = join(__dirname, 'logs');
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

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SkillSwap API',
    services: [
      {
        name: 'Auth Service',
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
      },
      {
        name: 'Projects Service',
        url: process.env.PROJECTS_SERVICE_URL || 'http://localhost:3002'
      },
      {
        name: 'Bids Service',
        url: process.env.BIDS_SERVICE_URL || 'http://localhost:3003'
      },
      {
        name: 'Messages Service',
        url: process.env.MESSAGES_SERVICE_URL || 'http://localhost:3004'
      },
      {
        name: 'Notifications Service',
        url: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005'
      }
    ]
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

export default app;
