import express from 'express';
import * as projectController from '../controllers/project.controller.js';
import { authenticate, authorize } from '../../../../shared/middlewares/auth-middleware.js';

const router = express.Router();

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Private/Client
 */
router.post('/', authenticate, authorize('client'), projectController.createProject);

/**
 * @route GET /api/projects
 * @desc Get all projects with filtering and pagination
 * @access Public
 */
router.get('/', projectController.getAllProjects);

/**
 * @route GET /api/projects/:id
 * @desc Get project by ID
 * @access Public
 */
router.get('/:id', projectController.getProjectById);

/**
 * @route PATCH /api/projects/:id
 * @desc Update project
 * @access Private/Client
 */
router.patch('/:id', authenticate, authorize('client'), projectController.updateProject);

/**
 * @route PATCH /api/projects/:id/status
 * @desc Update project status
 * @access Private/Client
 */
router.patch('/:id/status', authenticate, authorize('client'), projectController.updateProjectStatus);

/**
 * @route DELETE /api/projects/:id
 * @desc Delete project
 * @access Private/Client
 */
router.delete('/:id', authenticate, authorize('client'), projectController.deleteProject);

/**
 * @route GET /api/projects/client/:clientId
 * @desc Get projects by client ID
 * @access Public
 */
router.get('/client/:clientId', projectController.getProjectsByClientId);

export default router;
