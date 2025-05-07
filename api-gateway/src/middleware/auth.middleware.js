import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

/**
 * Verify JWT token from request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Check if user has required role
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} Middleware function
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      // Verify token first
      verifyToken(req, res, () => {
        // Convert roles to array if it's a string
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        
        // Check if user has required role
        if (!requiredRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.'
          });
        }
        
        next();
      });
    } catch (error) {
      logger.error(`Role check failed: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

export default {
  verifyToken,
  checkRole
};
