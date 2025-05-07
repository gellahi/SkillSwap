import express from 'express';
import * as messageController from '../controllers/message.controller.js';
import { authenticate } from '../../../../shared/middlewares/auth-middleware.js';

const router = express.Router();

/**
 * @route POST /api/messages
 * @desc Send a new message
 * @access Private
 */
router.post('/', authenticate, messageController.sendMessage);

/**
 * @route GET /api/messages/conversations/:conversationId/messages
 * @desc Get messages for a conversation
 * @access Private
 */
router.get('/conversations/:conversationId/messages', authenticate, messageController.getMessages);

/**
 * @route PATCH /api/messages/:id
 * @desc Edit a message
 * @access Private
 */
router.patch('/:id', authenticate, messageController.editMessage);

/**
 * @route DELETE /api/messages/:id
 * @desc Delete a message
 * @access Private
 */
router.delete('/:id', authenticate, messageController.deleteMessage);

/**
 * @route PATCH /api/messages/:id/read
 * @desc Mark message as read
 * @access Private
 */
router.patch('/:id/read', authenticate, messageController.markMessageAsRead);

export default router;
