import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../../../../shared/middlewares/auth-middleware.js';

const router = express.Router();

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, userController.getCurrentUser);

/**
 * @route PATCH /api/auth/me
 * @desc Update user profile
 * @access Private
 */
router.patch('/me', authenticate, userController.updateProfile);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', authenticate, userController.changePassword);

/**
 * @route GET /api/auth/users
 * @desc Get all users (admin only)
 * @access Private/Admin
 */
router.get('/users', authenticate, authorize('admin'), userController.getAllUsers);

/**
 * @route GET /api/auth/users/:id
 * @desc Get user by ID (admin only)
 * @access Private/Admin
 */
router.get('/users/:id', authenticate, authorize('admin'), userController.getUserById);

/**
 * @route PATCH /api/auth/users/:id
 * @desc Update user (admin only)
 * @access Private/Admin
 */
router.patch('/users/:id', authenticate, authorize('admin'), userController.updateUser);

/**
 * @route DELETE /api/auth/users/:id
 * @desc Delete user (admin only)
 * @access Private/Admin
 */
router.delete('/users/:id', authenticate, authorize('admin'), userController.deleteUser);

export default router;
