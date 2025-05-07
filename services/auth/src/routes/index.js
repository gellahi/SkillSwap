import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/', authRoutes);
router.use('/', userRoutes);

export default router;
