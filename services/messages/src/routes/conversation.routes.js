import express from 'express';
import * as conversationController from '../controllers/conversation.controller.js';
import { authenticate } from '../../../../shared/middlewares/auth-middleware.js';

const router = express.Router();

/**
 * @route POST /api/messages/conversations
 * @desc Create a new conversation
 * @access Private
 */
router.post('/', authenticate, conversationController.createConversation);

/**
 * @route GET /api/messages/conversations
 * @desc Get all conversations for current user
 * @access Private
 */
router.get('/', authenticate, conversationController.getConversations);

/**
 * @route GET /api/messages/conversations/:id
 * @desc Get conversation by ID
 * @access Private
 */
router.get('/:id', authenticate, conversationController.getConversationById);

/**
 * @route PATCH /api/messages/conversations/:id
 * @desc Update conversation
 * @access Private
 */
router.patch('/:id', authenticate, conversationController.updateConversation);

/**
 * @route PATCH /api/messages/conversations/:id/leave
 * @desc Leave conversation
 * @access Private
 */
router.patch('/:id/leave', authenticate, conversationController.leaveConversation);

/**
 * @route PATCH /api/messages/conversations/:id/read
 * @desc Mark conversation as read
 * @access Private
 */
router.patch('/:id/read', authenticate, conversationController.markConversationAsRead);

export default router;
