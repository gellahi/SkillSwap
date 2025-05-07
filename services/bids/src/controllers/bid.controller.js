import Bid from '../models/bid.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';
import axios from 'axios';

/**
 * Create a new bid
 * @route POST /api/bids
 * @access Private/Freelancer
 */
export const createBid = async (req, res, next) => {
  try {
    const {
      projectId,
      amount,
      deliveryTime,
      deliveryTimeUnit,
      proposal,
      attachments,
      milestones
    } = req.body;

    // Get freelancer ID from authenticated user
    const freelancerId = req.user.id;

    // Validate user role (only freelancers can create bids)
    if (req.user.role !== 'freelancer') {
      throw new ApiError(403, 'Only freelancers can create bids');
    }

    // Check if project exists and is open for bidding
    try {
      const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${projectId}`);
      const project = projectResponse.data.data;
      
      if (project.status !== 'open') {
        throw new ApiError(400, 'Project is not open for bidding');
      }
      
      // Check if freelancer has already bid on this project
      const existingBid = await Bid.findOne({ projectId, freelancerId, isActive: true });
      if (existingBid) {
        throw new ApiError(409, 'You have already placed a bid on this project');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(404, 'Project not found or service unavailable');
    }

    // Create new bid
    const bid = new Bid({
      projectId,
      freelancerId,
      amount,
      deliveryTime,
      deliveryTimeUnit: deliveryTimeUnit || 'days',
      proposal,
      attachments: attachments || [],
      milestones: milestones || []
    });

    // Save bid to database
    await bid.save();

    // Update project bid count
    try {
      await axios.patch(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${projectId}`, {
        bidCount: 1 // Increment by 1
      }, {
        headers: {
          Authorization: req.headers.authorization
        }
      });
    } catch (error) {
      // Log error but don't fail the bid creation
      console.error('Failed to update project bid count:', error.message);
    }

    // Notify project owner
    try {
      await axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
        userId: project.clientId,
        title: 'New Bid Received',
        message: `You have received a new bid on your project: ${project.title}`,
        type: 'bid',
        data: {
          projectId,
          bidId: bid._id
        }
      });
    } catch (error) {
      // Log error but don't fail the bid creation
      console.error('Failed to send notification:', error.message);
    }

    res.status(201).json({
      success: true,
      message: 'Bid created successfully',
      data: bid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bids for a project
 * @route GET /api/bids/project/:projectId
 * @access Public
 */
export const getBidsByProjectId = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Build query
    const query = { projectId, isActive: true };
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Execute query
    const bids = await Bid.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOptions);
    
    // Get total count
    const total = await Bid.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        bids,
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
 * Get all bids by a freelancer
 * @route GET /api/bids/freelancer/:freelancerId
 * @access Private
 */
export const getBidsByFreelancerId = async (req, res, next) => {
  try {
    const { freelancerId } = req.params;
    const { page = 1, limit = 10, status, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Check if user is authorized to view these bids
    if (req.user.id !== freelancerId && req.user.role !== 'admin') {
      throw new ApiError(403, 'You are not authorized to view these bids');
    }
    
    // Build query
    const query = { freelancerId, isActive: true };
    if (status) query.status = status;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Execute query
    const bids = await Bid.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOptions);
    
    // Get total count
    const total = await Bid.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        bids,
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
 * Get bid by ID
 * @route GET /api/bids/:id
 * @access Private
 */
export const getBidById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Check if user is authorized to view this bid
    // Project owner, bid owner, or admin can view
    let isAuthorized = false;
    
    if (req.user.role === 'admin') {
      isAuthorized = true;
    } else if (req.user.id === bid.freelancerId.toString()) {
      isAuthorized = true;
    } else {
      // Check if user is the project owner
      try {
        const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`);
        const project = projectResponse.data.data;
        
        if (req.user.id === project.clientId.toString()) {
          isAuthorized = true;
        }
      } catch (error) {
        console.error('Failed to fetch project:', error.message);
      }
    }
    
    if (!isAuthorized) {
      throw new ApiError(403, 'You are not authorized to view this bid');
    }
    
    res.status(200).json({
      success: true,
      data: bid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update bid
 * @route PATCH /api/bids/:id
 * @access Private/Freelancer
 */
export const updateBid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Check if user is the bid owner
    if (bid.freelancerId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to update this bid');
    }
    
    // Check if bid can be updated
    if (bid.status !== 'pending') {
      throw new ApiError(400, 'Bid cannot be updated because it is no longer pending');
    }
    
    // Don't allow updating certain fields
    const restrictedFields = ['projectId', 'freelancerId', 'status', 'counterOffers', 'clientFeedback', 'freelancerFeedback', 'acceptedAt', 'rejectedAt', 'withdrawnAt'];
    restrictedFields.forEach(field => {
      if (updates[field]) {
        delete updates[field];
      }
    });
    
    // Update bid
    Object.keys(updates).forEach(key => {
      bid[key] = updates[key];
    });
    
    // Save updated bid
    await bid.save();
    
    res.status(200).json({
      success: true,
      message: 'Bid updated successfully',
      data: bid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw bid
 * @route PATCH /api/bids/:id/withdraw
 * @access Private/Freelancer
 */
export const withdrawBid = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Check if user is the bid owner
    if (bid.freelancerId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to withdraw this bid');
    }
    
    // Check if bid can be withdrawn
    if (bid.status !== 'pending') {
      throw new ApiError(400, 'Bid cannot be withdrawn because it is no longer pending');
    }
    
    // Update bid status
    bid.status = 'withdrawn';
    bid.withdrawnAt = new Date();
    
    // Save updated bid
    await bid.save();
    
    res.status(200).json({
      success: true,
      message: 'Bid withdrawn successfully',
      data: bid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept bid
 * @route PATCH /api/bids/:id/accept
 * @access Private/Client
 */
export const acceptBid = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Check if project exists and user is the project owner
    try {
      const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`);
      const project = projectResponse.data.data;
      
      if (project.clientId.toString() !== req.user.id) {
        throw new ApiError(403, 'You are not authorized to accept this bid');
      }
      
      // Check if project is still open
      if (project.status !== 'open') {
        throw new ApiError(400, 'Project is not open for accepting bids');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(404, 'Project not found or service unavailable');
    }
    
    // Check if bid can be accepted
    if (bid.status !== 'pending') {
      throw new ApiError(400, 'Bid cannot be accepted because it is no longer pending');
    }
    
    // Update bid status
    bid.status = 'accepted';
    bid.acceptedAt = new Date();
    
    // Save updated bid
    await bid.save();
    
    // Update project status to in-progress and set awardedTo
    try {
      await axios.patch(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}/status`, {
        status: 'in-progress'
      }, {
        headers: {
          Authorization: req.headers.authorization
        }
      });
      
      await axios.patch(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`, {
        awardedTo: bid.freelancerId
      }, {
        headers: {
          Authorization: req.headers.authorization
        }
      });
    } catch (error) {
      // Log error but don't fail the bid acceptance
      console.error('Failed to update project status:', error.message);
    }
    
    // Notify freelancer
    try {
      await axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
        userId: bid.freelancerId,
        title: 'Bid Accepted',
        message: 'Your bid has been accepted! You can now start working on the project.',
        type: 'bid-accepted',
        data: {
          projectId: bid.projectId,
          bidId: bid._id
        }
      });
    } catch (error) {
      // Log error but don't fail the bid acceptance
      console.error('Failed to send notification:', error.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Bid accepted successfully',
      data: bid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject bid
 * @route PATCH /api/bids/:id/reject
 * @access Private/Client
 */
export const rejectBid = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Check if project exists and user is the project owner
    try {
      const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`);
      const project = projectResponse.data.data;
      
      if (project.clientId.toString() !== req.user.id) {
        throw new ApiError(403, 'You are not authorized to reject this bid');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(404, 'Project not found or service unavailable');
    }
    
    // Check if bid can be rejected
    if (bid.status !== 'pending') {
      throw new ApiError(400, 'Bid cannot be rejected because it is no longer pending');
    }
    
    // Update bid status
    bid.status = 'rejected';
    bid.rejectedAt = new Date();
    
    // Save updated bid
    await bid.save();
    
    // Notify freelancer
    try {
      await axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
        userId: bid.freelancerId,
        title: 'Bid Rejected',
        message: 'Your bid has been rejected. Don\'t worry, there are many other projects you can bid on!',
        type: 'bid-rejected',
        data: {
          projectId: bid.projectId,
          bidId: bid._id
        }
      });
    } catch (error) {
      // Log error but don't fail the bid rejection
      console.error('Failed to send notification:', error.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Bid rejected successfully',
      data: bid
    });
  } catch (error) {
    next(error);
  }
};
