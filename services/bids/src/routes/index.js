import express from 'express';
import bidRoutes from './bid.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'bids-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/', bidRoutes);

export default router;
