import express from 'express';
import notificationRoutes from './notification.routes.js';
import preferenceRoutes from './preference.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'notifications-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/', notificationRoutes);
router.use('/preferences', preferenceRoutes);

export default router;
