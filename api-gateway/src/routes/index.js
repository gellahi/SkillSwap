import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { apiLimiter, authLimiter } from '../middleware/rate-limit.middleware.js';
import {
  authServiceProxy,
  projectsServiceProxy,
  bidsServiceProxy,
  messagesServiceProxy,
  notificationsServiceProxy,
  voiceSearchServiceProxy
} from '../middleware/proxy.middleware.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (no token required)
router.post('/api/auth/signup', authLimiter, authServiceProxy);
router.post('/api/auth/login', authLimiter, authServiceProxy);
router.post('/api/auth/verify', authLimiter, authServiceProxy);
router.post('/api/auth/reset-password', authLimiter, authServiceProxy);
router.post('/api/auth/reset-password/verify', authLimiter, authServiceProxy);
router.post('/api/auth/refresh-token', authLimiter, authServiceProxy);

// Auth routes (token required)
router.use('/api/auth', verifyToken, authServiceProxy);

// Projects routes (public)
router.get('/api/projects', apiLimiter, projectsServiceProxy);
router.get('/api/projects/:id', apiLimiter, projectsServiceProxy);
router.get('/api/projects/client/:clientId', apiLimiter, projectsServiceProxy);
router.get('/api/projects/categories', apiLimiter, projectsServiceProxy);
router.get('/api/projects/categories/:id', apiLimiter, projectsServiceProxy);

// Projects routes (token required)
router.use('/api/projects', verifyToken, projectsServiceProxy);

// Bids routes (public)
router.get('/api/bids/project/:projectId', apiLimiter, bidsServiceProxy);

// Bids routes (token required)
router.use('/api/bids', verifyToken, bidsServiceProxy);

// Messages routes (token required)
router.use('/api/messages', verifyToken, messagesServiceProxy);

// Notifications routes (public endpoints for services)
router.post('/api/notify/in-app', apiLimiter, notificationsServiceProxy);
router.post('/api/notify/email', apiLimiter, notificationsServiceProxy);
router.post('/api/notify/sms', apiLimiter, notificationsServiceProxy);

// Notifications routes (token required)
router.use('/api/notify', verifyToken, notificationsServiceProxy);

// Voice Search routes (token required)
router.use('/api/voice-search', verifyToken, voiceSearchServiceProxy);

export default router;
