import express from 'express';
import messageRoutes from './message.routes.js';
import conversationRoutes from './conversation.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'messages-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/', messageRoutes);
router.use('/conversations', conversationRoutes);

export default router;
