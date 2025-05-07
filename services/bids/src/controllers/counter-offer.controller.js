import Bid from '../models/bid.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';
import axios from 'axios';

/**
 * Create a counter offer
 * @route POST /api/bids/:id/counter-offer
 * @access Private
 */
export const createCounterOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, deliveryTime, deliveryTimeUnit, message } = req.body;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Check if project exists
    let project;
    try {
      const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`);
      project = projectResponse.data.data;
    } catch (error) {
      throw new ApiError(404, 'Project not found or service unavailable');
    }
    
    // Check if user is authorized to create counter offer
    // Only the project owner or the freelancer who created the bid can create counter offers
    let isAuthorized = false;
    let recipientId;
    
    if (req.user.id === bid.freelancerId.toString()) {
      isAuthorized = true;
      recipientId = project.clientId;
    } else if (req.user.id === project.clientId.toString()) {
      isAuthorized = true;
      recipientId = bid.freelancerId;
    }
    
    if (!isAuthorized) {
      throw new ApiError(403, 'You are not authorized to create a counter offer for this bid');
    }
    
    // Check if bid is in a state where counter offers can be made
    if (bid.status !== 'pending' && bid.status !== 'countered') {
      throw new ApiError(400, 'Counter offers can only be made on pending or countered bids');
    }
    
    // Create counter offer
    const counterOffer = {
      amount,
      deliveryTime,
      deliveryTimeUnit: deliveryTimeUnit || 'days',
      message,
      createdBy: req.user.id,
      createdAt: new Date()
    };
    
    // Add counter offer to bid
    bid.counterOffers.push(counterOffer);
    
    // Update bid status
    bid.status = 'countered';
    
    // Save updated bid
    await bid.save();
    
    // Notify recipient
    try {
      await axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
        userId: recipientId,
        title: 'New Counter Offer',
        message: 'You have received a new counter offer on a bid',
        type: 'counter-offer',
        data: {
          projectId: bid.projectId,
          bidId: bid._id
        }
      });
    } catch (error) {
      // Log error but don't fail the counter offer creation
      console.error('Failed to send notification:', error.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Counter offer created successfully',
      data: {
        bid,
        counterOffer: bid.counterOffers[bid.counterOffers.length - 1]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept counter offer
 * @route PATCH /api/bids/:id/counter-offer/:counterOfferId/accept
 * @access Private
 */
export const acceptCounterOffer = async (req, res, next) => {
  try {
    const { id, counterOfferId } = req.params;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Find counter offer
    const counterOffer = bid.counterOffers.id(counterOfferId);
    if (!counterOffer) {
      throw new ApiError(404, 'Counter offer not found');
    }
    
    // Check if project exists
    let project;
    try {
      const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`);
      project = projectResponse.data.data;
    } catch (error) {
      throw new ApiError(404, 'Project not found or service unavailable');
    }
    
    // Check if user is authorized to accept counter offer
    // Only the user who did not create the counter offer can accept it
    let isAuthorized = false;
    let recipientId;
    
    if (req.user.id !== counterOffer.createdBy.toString()) {
      if (req.user.id === bid.freelancerId.toString() || req.user.id === project.clientId.toString()) {
        isAuthorized = true;
        recipientId = counterOffer.createdBy;
      }
    }
    
    if (!isAuthorized) {
      throw new ApiError(403, 'You are not authorized to accept this counter offer');
    }
    
    // Check if bid is in a state where counter offers can be accepted
    if (bid.status !== 'countered') {
      throw new ApiError(400, 'Counter offers can only be accepted on countered bids');
    }
    
    // Update bid with counter offer details
    bid.amount = counterOffer.amount;
    bid.deliveryTime = counterOffer.deliveryTime;
    bid.deliveryTimeUnit = counterOffer.deliveryTimeUnit;
    
    // Update bid status
    bid.status = 'pending';
    
    // Save updated bid
    await bid.save();
    
    // Notify recipient
    try {
      await axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
        userId: recipientId,
        title: 'Counter Offer Accepted',
        message: 'Your counter offer has been accepted',
        type: 'counter-offer-accepted',
        data: {
          projectId: bid.projectId,
          bidId: bid._id
        }
      });
    } catch (error) {
      // Log error but don't fail the counter offer acceptance
      console.error('Failed to send notification:', error.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Counter offer accepted successfully',
      data: bid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject counter offer
 * @route PATCH /api/bids/:id/counter-offer/:counterOfferId/reject
 * @access Private
 */
export const rejectCounterOffer = async (req, res, next) => {
  try {
    const { id, counterOfferId } = req.params;
    
    // Find bid
    const bid = await Bid.findById(id);
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }
    
    // Find counter offer
    const counterOffer = bid.counterOffers.id(counterOfferId);
    if (!counterOffer) {
      throw new ApiError(404, 'Counter offer not found');
    }
    
    // Check if project exists
    let project;
    try {
      const projectResponse = await axios.get(`${process.env.PROJECTS_SERVICE_URL}/api/projects/${bid.projectId}`);
      project = projectResponse.data.data;
    } catch (error) {
      throw new ApiError(404, 'Project not found or service unavailable');
    }
    
    // Check if user is authorized to reject counter offer
    // Only the user who did not create the counter offer can reject it
    let isAuthorized = false;
    let recipientId;
    
    if (req.user.id !== counterOffer.createdBy.toString()) {
      if (req.user.id === bid.freelancerId.toString() || req.user.id === project.clientId.toString()) {
        isAuthorized = true;
        recipientId = counterOffer.createdBy;
      }
    }
    
    if (!isAuthorized) {
      throw new ApiError(403, 'You are not authorized to reject this counter offer');
    }
    
    // Check if bid is in a state where counter offers can be rejected
    if (bid.status !== 'countered') {
      throw new ApiError(400, 'Counter offers can only be rejected on countered bids');
    }
    
    // Update bid status back to pending
    bid.status = 'pending';
    
    // Save updated bid
    await bid.save();
    
    // Notify recipient
    try {
      await axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
        userId: recipientId,
        title: 'Counter Offer Rejected',
        message: 'Your counter offer has been rejected',
        type: 'counter-offer-rejected',
        data: {
          projectId: bid.projectId,
          bidId: bid._id
        }
      });
    } catch (error) {
      // Log error but don't fail the counter offer rejection
      console.error('Failed to send notification:', error.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Counter offer rejected successfully',
      data: bid
    });
  } catch (error) {
    next(error);
  }
};
