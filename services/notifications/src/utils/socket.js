import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../../../../shared/middlewares/index.js';

let io;

/**
 * Initialize Socket.io server
 * @param {Object} server - HTTP server instance
 */
export const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, restrict to your frontend domain
      methods: ['GET', 'POST']
    }
  });

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY);
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}, User: ${socket.user.id}`);
    
    // Join user to their own room
    socket.join(`user:${socket.user.id}`);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io server initialized');
  
  return io;
};

/**
 * Get Socket.io server instance
 * @returns {Object} Socket.io server instance
 */
export const getSocketServer = () => {
  if (!io) {
    throw new Error('Socket.io server not initialized');
  }
  return io;
};

/**
 * Emit event to a specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToUser = (userId, event, data) => {
  if (!io) {
    logger.error('Socket.io server not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit(event, data);
  logger.info(`Emitted ${event} to user ${userId}`);
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToAll = (event, data) => {
  if (!io) {
    logger.error('Socket.io server not initialized');
    return;
  }
  
  io.emit(event, data);
  logger.info(`Emitted ${event} to all clients`);
};

export default {
  initSocketServer,
  getSocketServer,
  emitToUser,
  emitToAll
};
