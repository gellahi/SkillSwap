import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from '../utils/logger.js';

/**
 * Create proxy middleware for a service
 * @param {string} path - Path to proxy
 * @param {string} target - Target URL
 * @param {Object} options - Additional options
 * @returns {Function} Proxy middleware
 */
export const createServiceProxy = (path, target, options = {}) => {
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

/**
 * Auth service proxy middleware
 */
export const authServiceProxy = createServiceProxy(
  '/api/auth',
  process.env.AUTH_SERVICE_URL
);

/**
 * Projects service proxy middleware
 */
export const projectsServiceProxy = createServiceProxy(
  '/api/projects',
  process.env.PROJECTS_SERVICE_URL
);

/**
 * Bids service proxy middleware
 */
export const bidsServiceProxy = createServiceProxy(
  '/api/bids',
  process.env.BIDS_SERVICE_URL
);

/**
 * Messages service proxy middleware
 */
export const messagesServiceProxy = createServiceProxy(
  '/api/messages',
  process.env.MESSAGES_SERVICE_URL
);

/**
 * Notifications service proxy middleware
 */
export const notificationsServiceProxy = createServiceProxy(
  '/api/notify',
  process.env.NOTIFICATIONS_SERVICE_URL
);

export default {
  createServiceProxy,
  authServiceProxy,
  projectsServiceProxy,
  bidsServiceProxy,
  messagesServiceProxy,
  notificationsServiceProxy
};
