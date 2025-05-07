import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post('/signup', authController.signup);

/**
 * @route POST /api/auth/verify
 * @desc Verify user account with OTP
 * @access Public
 */
router.post('/verify', authController.verifyAccount);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/reset-password
 * @desc Request password reset
 * @access Public
 */
router.post('/reset-password', authController.requestPasswordReset);

/**
 * @route POST /api/auth/reset-password/verify
 * @desc Reset password with OTP
 * @access Public
 */
router.post('/reset-password/verify', authController.resetPassword);

export default router;
