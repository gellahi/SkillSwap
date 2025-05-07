import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate, authorize } from '../../../../shared/middlewares/auth-middleware.js';

const router = express.Router();

/**
 * @route POST /api/projects/categories
 * @desc Create a new category
 * @access Private/Admin
 */
router.post('/', authenticate, authorize('admin'), categoryController.createCategory);

/**
 * @route GET /api/projects/categories
 * @desc Get all categories
 * @access Public
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route GET /api/projects/categories/:id
 * @desc Get category by ID
 * @access Public
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route PATCH /api/projects/categories/:id
 * @desc Update category
 * @access Private/Admin
 */
router.patch('/:id', authenticate, authorize('admin'), categoryController.updateCategory);

/**
 * @route DELETE /api/projects/categories/:id
 * @desc Delete category
 * @access Private/Admin
 */
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

export default router;
