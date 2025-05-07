import Bid from '../models/bid.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';
import axios from 'axios';

/**
 * Add milestone to bid
 * @route POST /api/bids/:id/milestones
 * @access Private/Freelancer
 */
export const addMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, amount, dueDate } = req.body;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Check if user is the bid owner
    if (bid.freelancerId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to add milestones to this bid');
    }
    
    // Check if bid is in a state where milestones can be added
    if (bid.status !== 'pending' && bid.status !== 'countered') {
      throw new ApiError(400, 'Milestones can only be added to pending or countered bids');
    }
    
    // Create milestone
    const milestone = {
      title,
      description,
      amount,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: 'pending'
    };
    
    // Add milestone to bid
    bid.milestones.push(milestone);
    
    // Save updated bid
    await bid.save();
    
    res.status(201).json({
      success: true,
      message: 'Milestone added successfully',
      data: {
        bid,
        milestone: bid.milestones[bid.milestones.length - 1]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update milestone
 * @route PATCH /api/bids/:id/milestones/:milestoneId
 * @access Private/Freelancer
 */
export const updateMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const updates = req.body;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Find milestone
    const milestone = bid.milestones.id(milestoneId);
    if (!milestone) {
      throw new ApiError(404, 'Milestone not found');
    }
    
    // Check if user is the bid owner
    if (bid.freelancerId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to update milestones for this bid');
    }
    
    // Check if bid is in a state where milestones can be updated
    if (bid.status !== 'pending' && bid.status !== 'countered') {
      throw new ApiError(400, 'Milestones can only be updated for pending or countered bids');
    }
    
    // Don't allow updating status directly
    if (updates.status) {
      delete updates.status;
    }
    
    // Update milestone
    Object.keys(updates).forEach(key => {
      milestone[key] = updates[key];
    });
    
    // Save updated bid
    await bid.save();
    
    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: {
        bid,
        milestone
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete milestone
 * @route DELETE /api/bids/:id/milestones/:milestoneId
 * @access Private/Freelancer
 */
export const deleteMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Find milestone
    const milestone = bid.milestones.id(milestoneId);
    if (!milestone) {
      throw new ApiError(404, 'Milestone not found');
    }
    
    // Check if user is the bid owner
    if (bid.freelancerId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to delete milestones for this bid');
    }
    
    // Check if bid is in a state where milestones can be deleted
    if (bid.status !== 'pending' && bid.status !== 'countered') {
      throw new ApiError(400, 'Milestones can only be deleted for pending or countered bids');
    }
    
    // Remove milestone
    milestone.deleteOne();
    
    // Save updated bid
    await bid.save();
    
    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully',
      data: bid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update milestone status
 * @route PATCH /api/bids/:id/milestones/:milestoneId/status
 * @access Private
 */
export const updateMilestoneStatus = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'approved'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Find milestone
    const milestone = bid.milestones.id(milestoneId);
    if (!milestone) {
      throw new ApiError(404, 'Milestone not found');
    }
    
    // Check if project exists
    let project;
    try {
      const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`);
      project = projectResponse.data.data;
    } catch (error) {
      throw new ApiError(404, 'Project not found or service unavailable');
    }
    
    // Check if user is authorized to update milestone status
    let isAuthorized = false;
    let recipientId;
    
    // Freelancer can update to 'in-progress' or 'completed'
    if (req.user.id === bid.freelancerId.toString() && (status === 'in-progress' || status === 'completed')) {
      isAuthorized = true;
      recipientId = project.clientId;
    }
    
    // Client can update to 'approved'
    if (req.user.id === project.clientId.toString() && status === 'approved') {
      isAuthorized = true;
      recipientId = bid.freelancerId;
    }
    
    if (!isAuthorized) {
      throw new ApiError(403, 'You are not authorized to update this milestone status');
    }
    
    // Check if bid is accepted
    if (bid.status !== 'accepted') {
      throw new ApiError(400, 'Milestone status can only be updated for accepted bids');
    }
    
    // Check if status transition is valid
    if (status === 'in-progress' && milestone.status !== 'pending') {
      throw new ApiError(400, 'Milestone can only be set to in-progress from pending status');
    }
    
    if (status === 'completed' && milestone.status !== 'in-progress') {
      throw new ApiError(400, 'Milestone can only be set to completed from in-progress status');
    }
    
    if (status === 'approved' && milestone.status !== 'completed') {
      throw new ApiError(400, 'Milestone can only be approved when it is completed');
    }
    
    // Update milestone status
    milestone.status = status;
    
    // Save updated bid
    await bid.save();
    
    // Notify recipient
    try {
      await axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
        userId: recipientId,
        title: 'Milestone Status Updated',
        message: `Milestone "${milestone.title}" has been updated to ${status}`,
        type: 'milestone-update',
        data: {
          projectId: bid.projectId,
          bidId: bid._id,
          milestoneId: milestone._id
        }
      });
    } catch (error) {
      // Log error but don't fail the milestone update
      console.error('Failed to send notification:', error.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Milestone status updated successfully',
      data: {
        bid,
        milestone
      }
    });
  } catch (error) {
    next(error);
  }
};
