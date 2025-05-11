import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';
import OTP from '../models/otp.model.js';
import { ApiError, logger } from '../../../../shared/middlewares/error-handler.js';
import { generateOTP, hashOTP } from '../../../../shared/utils/otp-utils.js';
import { CacheService } from '../../../../shared/utils/index.js';

// Initialize cache service
const cache = new CacheService({
  keyPrefix: 'auth:session:'
});

/**
 * Register a new user
 * @route POST /api/auth/signup
 * @access Public
 */
export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'client',
      phoneNumber
    });

    // Save user to database
    await user.save();

    // Generate OTP for verification
    const otp = generateOTP(6);
    const otpHash = hashOTP(otp, process.env.OTP_SECRET);

    // Calculate expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save OTP to database
    await new OTP({
      userId: user._id,
      email: user.email,
      otpHash,
      purpose: 'verification',
      expiresAt
    }).save();

    // In a real application, send OTP via email or SMS
    // For now, we'll just return it in the response (for development only)

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user account with OTP
 * @route POST /api/auth/verify
 * @access Public
 */
export const verifyAccount = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    // Find the latest OTP for this user
    const otpRecord = await OTP.findOne({
      userId,
      purpose: 'verification',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    // Verify OTP
    const computedHash = hashOTP(otp, process.env.OTP_SECRET);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(otpRecord.otpHash)
    );

    if (!isValid) {
      throw new ApiError(400, 'Invalid OTP');
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update user verification status
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new ApiError(403, 'Please verify your account before logging in');
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update user's refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Store session data in Redis
    const sessionData = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: new Date()
    };

    // Use the refresh token as the session key (without the signature part for security)
    const sessionKey = `session:${refreshToken.split('.').slice(0, 2).join('.')}`;

    // Store session with TTL matching the refresh token expiry
    const refreshTtl = parseInt(process.env.JWT_REFRESH_EXPIRY_SECONDS || 7 * 24 * 60 * 60); // 7 days in seconds
    await cache.set(sessionKey, sessionData, refreshTtl);
    logger.info(`Created session for user: ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset OTP'
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP(6);
    const otpHash = hashOTP(otp, process.env.OTP_SECRET);

    // Calculate expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save OTP to database
    await new OTP({
      userId: user._id,
      email: user.email,
      otpHash,
      purpose: 'password-reset',
      expiresAt
    }).save();

    // In a real application, send OTP via email
    // For now, we'll just return it in the response (for development only)

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
      data: {
        userId: user._id,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with OTP
 * @route POST /api/auth/reset-password/verify
 * @access Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, newPassword } = req.body;

    // Find the latest OTP for this user
    const otpRecord = await OTP.findOne({
      userId,
      purpose: 'password-reset',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    // Verify OTP
    const computedHash = hashOTP(otp, process.env.OTP_SECRET);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(otpRecord.otpHash)
    );

    if (!isValid) {
      throw new ApiError(400, 'Invalid OTP');
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update user's password
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.password = newPassword;
    // Invalidate refresh token
    user.refreshToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate access token
 * @param {Object} user - User object
 * @returns {string} JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_PRIVATE_KEY,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h',
      algorithm: 'RS256'
    }
  );
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id
    },
    process.env.JWT_PRIVATE_KEY,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
      algorithm: 'RS256'
    }
  );
};
