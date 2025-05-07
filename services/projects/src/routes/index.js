import express from 'express';
import projectRoutes from './project.routes.js';
import categoryRoutes from './category.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'projects-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/', projectRoutes);
router.use('/categories', categoryRoutes);

export default router;
