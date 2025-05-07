import Category from '../models/category.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';

/**
 * Create a new category
 * @route POST /api/projects/categories
 * @access Private/Admin
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, order, parentCategory } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new ApiError(409, 'Category with this name already exists');
    }

    // Create new category
    const category = new Category({
      name,
      description,
      icon,
      order,
      parentCategory
    });

    // Save category to database
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories
 * @route GET /api/projects/categories
 * @access Public
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    
    // Build query
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Execute query
    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 * @route GET /api/projects/categories/:id
 * @access Public
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 * @route PATCH /api/projects/categories/:id
 * @access Private/Admin
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find category
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    
    // Check if name is being updated and if it already exists
    if (updates.name && updates.name !== category.name) {
      const existingCategory = await Category.findOne({ name: updates.name });
      if (existingCategory) {
        throw new ApiError(409, 'Category with this name already exists');
      }
    }
    
    // Update category
    Object.keys(updates).forEach(key => {
      category[key] = updates[key];
    });
    
    // Save updated category
    await category.save();
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 * @route DELETE /api/projects/categories/:id
 * @access Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find category
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    
    // Check if category is used in any projects
    // This would require importing the Project model, but for simplicity we'll skip this check
    
    // Delete category
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
