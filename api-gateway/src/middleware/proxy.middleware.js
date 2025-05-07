import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Create proxy middleware for a service
 * @param {string} path - Path to proxy
 * @param {string} target - Target URL
 * @param {Object} options - Additional options
 * @returns {Function} Proxy middleware
 */
export const createServiceProxy = (path, target, options = {}) => {
  // Check if target is defined
  if (!target) {
    logger.error(`Missing target URL for path: ${path}`);
    throw new Error(`Missing target URL for path: ${path}. Please check your environment variables.`);
  }

  logger.info(`Creating proxy for path: ${path} to target: ${target}`);

  const defaultOptions = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${path}`]: ''
    },
    logLevel: 'silent',
    onProxyReq: (proxyReq, req, res) => {
      // Log the proxied request
      logger.info(`Proxying ${req.method} ${req.originalUrl} to ${target}${proxyReq.path}`);

      // Pass the user object from the request to the proxied service
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(500).json({
        success: false,
        message: 'Service unavailable'
      });
    }
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  return createProxyMiddleware(mergedOptions);
};

// Log environment variables for debugging
logger.info('Environment variables for services:');
logger.info(`AUTH_SERVICE_URL: ${process.env.AUTH_SERVICE_URL}`);
logger.info(`PROJECTS_SERVICE_URL: ${process.env.PROJECTS_SERVICE_URL}`);
logger.info(`BIDS_SERVICE_URL: ${process.env.BIDS_SERVICE_URL}`);
logger.info(`MESSAGES_SERVICE_URL: ${process.env.MESSAGES_SERVICE_URL}`);
logger.info(`NOTIFICATIONS_SERVICE_URL: ${process.env.NOTIFICATIONS_SERVICE_URL}`);

/**
 * Auth service proxy middleware
 */
export const authServiceProxy = createServiceProxy(
  '/api/auth',
  process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
);

/**
 * Projects service proxy middleware
 */
export const projectsServiceProxy = createServiceProxy(
  '/api/projects',
  process.env.PROJECTS_SERVICE_URL || 'http://localhost:3002'
);

/**
 * Bids service proxy middleware
 */
export const bidsServiceProxy = createServiceProxy(
  '/api/bids',
  process.env.BIDS_SERVICE_URL || 'http://localhost:3003'
);

/**
 * Messages service proxy middleware
 */
export const messagesServiceProxy = createServiceProxy(
  '/api/messages',
  process.env.MESSAGES_SERVICE_URL || 'http://localhost:3004'
);

/**
 * Notifications service proxy middleware
 */
export const notificationsServiceProxy = createServiceProxy(
  '/api/notify',
  process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005'
);

export default {
  createServiceProxy,
  authServiceProxy,
  projectsServiceProxy,
  bidsServiceProxy,
  messagesServiceProxy,
  notificationsServiceProxy
};
