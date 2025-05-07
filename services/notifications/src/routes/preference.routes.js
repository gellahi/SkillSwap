import express from 'express';
import * as preferenceController from '../controllers/preference.controller.js';
import { authenticate } from '../../../../shared/middlewares/auth-middleware.js';

const router = express.Router();

/**
 * @route GET /api/notify/preferences
 * @desc Get notification preferences for current user
 * @access Private
 */
router.get('/', authenticate, preferenceController.getPreferences);

/**
 * @route PATCH /api/notify/preferences
 * @desc Update notification preferences
 * @access Private
 */
router.patch('/', authenticate, preferenceController.updatePreferences);

/**
 * @route POST /api/notify/preferences/reset
 * @desc Reset notification preferences to default
 * @access Private
 */
router.post('/reset', authenticate, preferenceController.resetPreferences);

export default router;
