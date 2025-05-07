import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';
import axios from 'axios';
import { emitToUser } from '../utils/socket.js';

/**
 * Create a new conversation
 * @route POST /api/messages/conversations
 * @access Private
 */
export const createConversation = async (req, res, next) => {
  try {
    const { participants, projectId, title, type } = req.body;
    
    // Ensure current user is included in participants
    const allParticipants = [...new Set([...participants, req.user.id])];
    
    // Validate participants (ensure they exist in Auth Service)
    try {
      // In a real implementation, we would validate participants with Auth Service
      // For now, we'll skip this step
    } catch (error) {
      throw new ApiError(400, 'One or more participants do not exist');
    }
    
    // Check if direct conversation between these users already exists
    if (type === 'direct' && allParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        participants: { $all: allParticipants, $size: 2 },
        type: 'direct'
      });
      
      if (existingConversation) {
        return res.status(200).json({
          success: true,
          message: 'Conversation already exists',
          data: existingConversation
        });
      }
    }
    
    // Create new conversation
    const conversation = new Conversation({
      participants: allParticipants,
      projectId,
      title: title || null,
      type: type || 'direct',
      metadata: {}
    });
    
    // Save conversation to database
    await conversation.save();
    
    // Notify participants about new conversation
    allParticipants.forEach(participantId => {
      if (participantId !== req.user.id) {
        emitToUser(participantId, 'new_conversation', {
          conversationId: conversation._id,
          initiator: req.user.id
        });
        
        // Send notification via Notifications Service
        try {
          axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
            userId: participantId,
            title: 'New Conversation',
            message: `You have been added to a new conversation${title ? `: ${title}` : ''}`,
            type: 'conversation',
            data: {
              conversationId: conversation._id
            }
          });
        } catch (error) {
          console.error('Failed to send notification:', error.message);
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all conversations for current user
 * @route GET /api/messages/conversations
 * @access Private
 */
export const getConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {
      participants: req.user.id,
      isActive: true
    };
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const conversations = await Conversation.find(query)
      .sort({ 'lastMessage.timestamp': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('participants', 'firstName lastName profilePicture');
    
    // Get total count
    const total = await Conversation.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        conversations,
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
 * Get conversation by ID
 * @route GET /api/messages/conversations/:id
 * @access Private
 */
export const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findById(id)
      .populate('participants', 'firstName lastName profilePicture');
    
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      throw new ApiError(403, 'You are not a participant in this conversation');
    }
    
    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update conversation
 * @route PATCH /api/messages/conversations/:id
 * @access Private
 */
export const updateConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, participants } = req.body;
    
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      throw new ApiError(403, 'You are not a participant in this conversation');
    }
    
    // Update fields if provided
    if (title !== undefined) {
      conversation.title = title;
    }
    
    // Add new participants if provided
    if (participants && participants.length > 0) {
      // Ensure no duplicates
      const newParticipants = [...new Set([...conversation.participants.map(p => p.toString()), ...participants])];
      conversation.participants = newParticipants;
      
      // Notify new participants
      participants.forEach(participantId => {
        emitToUser(participantId, 'added_to_conversation', {
          conversationId: conversation._id,
          addedBy: req.user.id
        });
        
        // Send notification via Notifications Service
        try {
          axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
            userId: participantId,
            title: 'Added to Conversation',
            message: `You have been added to a conversation${conversation.title ? `: ${conversation.title}` : ''}`,
            type: 'conversation',
            data: {
              conversationId: conversation._id
            }
          });
        } catch (error) {
          console.error('Failed to send notification:', error.message);
        }
      });
    }
    
    // Save updated conversation
    await conversation.save();
    
    res.status(200).json({
      success: true,
      message: 'Conversation updated successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave conversation
 * @route PATCH /api/messages/conversations/:id/leave
 * @access Private
 */
export const leaveConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      throw new ApiError(403, 'You are not a participant in this conversation');
    }
    
    // Remove user from participants
    conversation.participants = conversation.participants.filter(p => p.toString() !== req.user.id);
    
    // If no participants left, mark conversation as inactive
    if (conversation.participants.length === 0) {
      conversation.isActive = false;
    }
    
    // Save updated conversation
    await conversation.save();
    
    // Notify remaining participants
    conversation.participants.forEach(participantId => {
      emitToUser(participantId, 'user_left_conversation', {
        conversationId: conversation._id,
        userId: req.user.id
      });
    });
    
    res.status(200).json({
      success: true,
      message: 'Left conversation successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark conversation as read
 * @route PATCH /api/messages/conversations/:id/read
 * @access Private
 */
export const markConversationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      throw new ApiError(403, 'You are not a participant in this conversation');
    }
    
    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversationId: id,
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            timestamp: new Date()
          }
        }
      }
    );
    
    // Update conversation readBy
    const readByIndex = conversation.readBy.findIndex(r => r.user.toString() === req.user.id);
    if (readByIndex === -1) {
      conversation.readBy.push({
        user: req.user.id,
        timestamp: new Date()
      });
    } else {
      conversation.readBy[readByIndex].timestamp = new Date();
    }
    
    await conversation.save();
    
    res.status(200).json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    next(error);
  }
};
