import Project from '../models/project.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';

/**
 * Create a new project
 * @route POST /api/projects
 * @access Private/Client
 */
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requirements,
      budget,
      deadline,
      category,
      skills,
      location,
      duration,
      durationType,
      visibility,
      invitedFreelancers,
      attachments
    } = req.body;

    // Get client ID from authenticated user
    const clientId = req.user.id;

    // Validate user role (only clients can create projects)
    if (req.user.role !== 'client') {
      throw new ApiError(403, 'Only clients can create projects');
    }

    // Create new project
    const project = new Project({
      title,
      description,
      requirements,
      clientId,
      budget,
      deadline: new Date(deadline),
      category,
      skills: skills || [],
      location: location || 'remote',
      duration,
      durationType: durationType || 'days',
      visibility: visibility || 'public',
      invitedFreelancers: invitedFreelancers || [],
      attachments: attachments || []
    });

    // Save project to database
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all projects with filtering and pagination
 * @route GET /api/projects
 * @access Public
 */
export const getAllProjects = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      minBudget,
      maxBudget,
      search,
      sort = 'createdAt',
      order = 'desc',
      clientId
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    // Add filters if provided
    if (status) query.status = status;
    if (category) query.category = category;
    if (clientId) query.clientId = clientId;
    
    // Budget range
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // If searching, add text score to sort
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    }
    
    // Execute query
    const projects = await Project.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOptions)
      .select(search ? { score: { $meta: 'textScore' } } : {});
    
    // Get total count
    const total = await Project.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID
 * @route GET /api/projects/:id
 * @access Public
 */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    // Increment view count
    project.views += 1;
    await project.save();
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project
 * @route PATCH /api/projects/:id
 * @access Private/Client
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find project
    const project = await Project.findById(id);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    // Check if user is the project owner
    if (project.clientId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to update this project');
    }
    
    // Don't allow updating clientId
    if (updates.clientId) {
      delete updates.clientId;
    }
    
    // Don't allow updating status directly (use separate endpoint)
    if (updates.status) {
      delete updates.status;
    }
    
    // Update project
    Object.keys(updates).forEach(key => {
      project[key] = updates[key];
    });
    
    // Save updated project
    await project.save();
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project status
 * @route PATCH /api/projects/:id/status
 * @access Private/Client
 */
export const updateProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['open', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }
    
    // Find project
    const project = await Project.findById(id);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    // Check if user is the project owner
    if (project.clientId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to update this project');
    }
    
    // Update status
    project.status = status;
    
    // If status is completed, set completedAt
    if (status === 'completed') {
      project.completedAt = new Date();
    }
    
    // Save updated project
    await project.save();
    
    res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project
 * @route DELETE /api/projects/:id
 * @access Private/Client
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find project
    const project = await Project.findById(id);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    // Check if user is the project owner
    if (project.clientId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to delete this project');
    }
    
    // Check if project has bids or is in progress
    if (project.status === 'in-progress') {
      throw new ApiError(400, 'Cannot delete a project that is in progress');
    }
    
    // Soft delete by setting isActive to false
    project.isActive = false;
    await project.save();
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get projects by client ID
 * @route GET /api/projects/client/:clientId
 * @access Public
 */
export const getProjectsByClientId = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query = { clientId, isActive: true };
    if (status) query.status = status;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const projects = await Project.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await Project.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
