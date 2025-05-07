import jwt from 'jsonwebtoken';
import { ApiError } from './error-handler.js';

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. No token provided');
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'Authentication required. Invalid token format');
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
      
      // Add user info to request
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token expired');
      }
      throw new ApiError(401, 'Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 * @param {...String} roles - Roles allowed to access the route
 * @returns {Function} Express middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to access this resource'));
    }
    
    next();
  };
};

export default {
  authenticate,
  authorize
};
