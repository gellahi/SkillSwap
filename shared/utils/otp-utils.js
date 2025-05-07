import crypto from 'crypto';

/**
 * Generate a random OTP code
 * @param {number} length - Length of OTP code (default: 6)
 * @returns {string} OTP code
 */
export const generateOTP = (length = 6) => {
  // Generate a random number with the specified length
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Generate a secure OTP code using crypto
 * @param {number} length - Length of OTP code (default: 6)
 * @returns {string} Secure OTP code
 */
export const generateSecureOTP = (length = 6) => {
  const buffer = crypto.randomBytes(Math.ceil(length / 2));
  const otp = parseInt(buffer.toString('hex'), 16).toString().slice(0, length);
  return otp.padStart(length, '0');
};

/**
 * Hash an OTP code for storage
 * @param {string} otp - OTP code
 * @param {string} secret - Secret key for hashing
 * @returns {string} Hashed OTP
 */
export const hashOTP = (otp, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(otp)
    .digest('hex');
};

/**
 * Verify an OTP code against a hash
 * @param {string} otp - OTP code to verify
 * @param {string} hash - Hashed OTP
 * @param {string} secret - Secret key used for hashing
 * @returns {boolean} True if OTP is valid
 */
export const verifyOTP = (otp, hash, secret) => {
  const computedHash = hashOTP(otp, secret);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(hash)
  );
};

export default {
  generateOTP,
  generateSecureOTP,
  hashOTP,
  verifyOTP
};
