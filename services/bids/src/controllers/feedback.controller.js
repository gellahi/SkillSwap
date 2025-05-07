import Bid from '../models/bid.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';
import axios from 'axios';

/**
 * Add client feedback
 * @route POST /api/bids/:id/feedback/client
 * @access Private/Client
 */
export const addClientFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5');
    }
    
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
        throw new ApiError(403, 'You are not authorized to add client feedback to this bid');
      }
      
      // Check if project is completed
      if (project.status !== 'completed') {
        throw new ApiError(400, 'Feedback can only be added to completed projects');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(404, 'Project not found or service unavailable');
    }
    
    // Check if feedback already exists
    if (bid.clientFeedback && bid.clientFeedback.rating) {
      throw new ApiError(400, 'Client feedback already exists for this bid');
    }
    
    // Add client feedback
    bid.clientFeedback = {
      rating,
      comment,
      createdAt: new Date()
    };
    
    // Save updated bid
    await bid.save();
    
    // Notify freelancer
    try {
      await axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
        userId: bid.freelancerId,
        title: 'New Feedback Received',
        message: 'You have received feedback from the client',
        type: 'feedback',
        data: {
          projectId: bid.projectId,
          bidId: bid._id
        }
      });
    } catch (error) {
      // Log error but don't fail the feedback addition
      console.error('Failed to send notification:', error.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Client feedback added successfully',
      data: {
        bid,
        feedback: bid.clientFeedback
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add freelancer feedback
 * @route POST /api/bids/:id/feedback/freelancer
 * @access Private/Freelancer
 */
export const addFreelancerFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5');
    }
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Check if user is the bid owner
    if (bid.freelancerId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to add freelancer feedback to this bid');
    }
    
    // Check if project exists and is completed
    try {
      const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`);
      const project = projectResponse.data.data;
      
      // Check if project is completed
      if (project.status !== 'completed') {
        throw new ApiError(400, 'Feedback can only be added to completed projects');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(404, 'Project not found or service unavailable');
    }
    
    // Check if feedback already exists
    if (bid.freelancerFeedback && bid.freelancerFeedback.rating) {
      throw new ApiError(400, 'Freelancer feedback already exists for this bid');
    }
    
    // Add freelancer feedback
    bid.freelancerFeedback = {
      rating,
      comment,
      createdAt: new Date()
    };
    
    // Save updated bid
    await bid.save();
    
    // Notify client
    try {
      const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`);
      const project = projectResponse.data.data;
      
      await axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
        userId: project.clientId,
        title: 'New Feedback Received',
        message: 'You have received feedback from the freelancer',
        type: 'feedback',
        data: {
          projectId: bid.projectId,
          bidId: bid._id
        }
      });
    } catch (error) {
      // Log error but don't fail the feedback addition
      console.error('Failed to send notification:', error.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Freelancer feedback added successfully',
      data: {
        bid,
        feedback: bid.freelancerFeedback
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback for a bid
 * @route GET /api/bids/:id/feedback
 * @access Private
 */
export const getFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Check if user is authorized to view feedback
    // Project owner, bid owner, or admin can view feedback
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
      throw new ApiError(403, 'You are not authorized to view feedback for this bid');
    }
    
    res.status(200).json({
      success: true,
      data: {
        clientFeedback: bid.clientFeedback || null,
        freelancerFeedback: bid.freelancerFeedback || null
      }
    });
  } catch (error) {
    next(error);
  }
};
