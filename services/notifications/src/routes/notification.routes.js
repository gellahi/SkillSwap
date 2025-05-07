import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../../../../shared/middlewares/auth-middleware.js';

const router = express.Router();

/**
 * @route POST /api/notify/in-app
 * @desc Send in-app notification
 * @access Private
 */
router.post('/in-app', notificationController.sendInAppNotification);

/**
 * @route POST /api/notify/email
 * @desc Send email notification
 * @access Private
 */
router.post('/email', notificationController.sendEmailNotification);

/**
 * @route POST /api/notify/sms
 * @desc Send SMS notification
 * @access Private
 */
router.post('/sms', notificationController.sendSMSNotification);

/**
 * @route GET /api/notify
 * @desc Get notifications for current user
 * @access Private
 */
router.get('/', authenticate, notificationController.getNotifications);

/**
 * @route PATCH /api/notify/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.patch('/:id/read', authenticate, notificationController.markAsRead);

/**
 * @route PATCH /api/notify/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @route DELETE /api/notify/:id
 * @desc Delete notification
 * @access Private
 */
router.delete('/:id', authenticate, notificationController.deleteNotification);

export default router;
