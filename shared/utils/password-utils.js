import bcrypt from 'bcrypt';

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password, saltRounds = 12) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches hash
 */
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Error comparing password: ${error.message}`);
  }
};

export default {
  hashPassword,
  comparePassword
};
