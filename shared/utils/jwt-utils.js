import jwt from 'jsonwebtoken';

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret key
 * @param {Object} options - JWT options
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload, secret, options = {}) => {
  const defaultOptions = {
    expiresIn: '1h', // Default expiration time
    algorithm: 'RS256' // Use RSA SHA-256 algorithm
  };
  
  return jwt.sign(payload, secret, { ...defaultOptions, ...options });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret key
 * @param {Object} options - JWT options
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload, secret, options = {}) => {
  const defaultOptions = {
    expiresIn: '7d', // Default expiration time
    algorithm: 'RS256' // Use RSA SHA-256 algorithm
  };
  
  return jwt.sign(payload, secret, { ...defaultOptions, ...options });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret key
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};
