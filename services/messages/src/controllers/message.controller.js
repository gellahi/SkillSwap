import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';
import axios from 'axios';
import { emitToUser } from '../utils/socket.js';

/**
 * Send a new message
 * @route POST /api/messages
 * @access Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, attachments, replyTo } = req.body;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      throw new ApiError(403, 'You are not a participant in this conversation');
    }
    
    // Check if replying to a valid message
    if (replyTo) {
      const replyMessage = await Message.findById(replyTo);
      if (!replyMessage || replyMessage.conversationId.toString() !== conversationId) {
        throw new ApiError(400, 'Invalid reply message');
      }
    }
    
    // Create new message
    const message = new Message({
      conversationId,
      sender: req.user.id,
      text,
      attachments: attachments || [],
      replyTo,
      readBy: [{
        user: req.user.id,
        timestamp: new Date()
      }]
    });
    
    // Save message to database
    await message.save();
    
    // Update conversation with last message
    conversation.lastMessage = {
      text,
      sender: req.user.id,
      timestamp: new Date()
    };
    
    await conversation.save();
    
    // Notify other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        emitToUser(participantId.toString(), 'new_message', {
          message: {
            _id: message._id,
            conversationId,
            sender: req.user.id,
            text,
            createdAt: message.createdAt
          }
        });
        
        // Send notification via Notifications Service
        try {
          axios.post(`${process.env.NOTIFICATIONS_SERVICE_URL}/api/notify/in-app`, {
            userId: participantId,
            title: 'New Message',
            message: `You have a new message${conversation.title ? ` in ${conversation.title}` : ''}`,
            type: 'message',
            data: {
              conversationId,
              messageId: message._id
            }
          });
        } catch (error) {
          console.error('Failed to send notification:', error.message);
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages for a conversation
 * @route GET /api/messages/conversations/:conversationId/messages
 * @access Private
 */
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      throw new ApiError(403, 'You are not a participant in this conversation');
    }
    
    // Build query
    const query = {
      conversationId,
      isDeleted: false
    };
    
    // If 'before' parameter is provided, get messages before that timestamp
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'firstName lastName profilePicture')
      .populate('replyTo', 'text sender');
    
    // Get total count
    const total = await Message.countDocuments(query);
    
    // Mark messages as read by current user
    const messageIds = messages.map(message => message._id);
    if (messageIds.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: messageIds },
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
    }
    
    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
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
 * Edit a message
 * @route PATCH /api/messages/:id
 * @access Private
 */
export const editMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    const message = await Message.findById(id);
    if (!message) {
      throw new ApiError(404, 'Message not found');
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      throw new ApiError(403, 'You can only edit your own messages');
    }
    
    // Check if message is deleted
    if (message.isDeleted) {
      throw new ApiError(400, 'Cannot edit a deleted message');
    }
    
    // Save original text to edit history
    if (!message.isEdited) {
      message.editHistory = [{
        text: message.text,
        timestamp: message.createdAt
      }];
    } else {
      message.editHistory.push({
        text: message.text,
        timestamp: new Date()
      });
    }
    
    // Update message
    message.text = text;
    message.isEdited = true;
    
    // Save updated message
    await message.save();
    
    // Get conversation
    const conversation = await Conversation.findById(message.conversationId);
    
    // If this is the last message in the conversation, update it
    if (conversation.lastMessage && 
        conversation.lastMessage.sender.toString() === req.user.id && 
        new Date(conversation.lastMessage.timestamp).getTime() === new Date(message.createdAt).getTime()) {
      conversation.lastMessage.text = text;
      await conversation.save();
    }
    
    // Notify other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        emitToUser(participantId.toString(), 'message_updated', {
          messageId: message._id,
          text,
          conversationId: message.conversationId
        });
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a message
 * @route DELETE /api/messages/:id
 * @access Private
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    if (!message) {
      throw new ApiError(404, 'Message not found');
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      throw new ApiError(403, 'You can only delete your own messages');
    }
    
    // Soft delete message
    message.isDeleted = true;
    message.text = 'This message has been deleted';
    message.deletedAt = new Date();
    
    // Save updated message
    await message.save();
    
    // Get conversation
    const conversation = await Conversation.findById(message.conversationId);
    
    // If this is the last message in the conversation, update it
    if (conversation.lastMessage && 
        conversation.lastMessage.sender.toString() === req.user.id && 
        new Date(conversation.lastMessage.timestamp).getTime() === new Date(message.createdAt).getTime()) {
      conversation.lastMessage.text = 'This message has been deleted';
      await conversation.save();
    }
    
    // Notify other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        emitToUser(participantId.toString(), 'message_deleted', {
          messageId: message._id,
          conversationId: message.conversationId
        });
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read
 * @route PATCH /api/messages/:id/read
 * @access Private
 */
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    if (!message) {
      throw new ApiError(404, 'Message not found');
    }
    
    // Check if user is a participant in the conversation
    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      throw new ApiError(403, 'You are not a participant in this conversation');
    }
    
    // Check if already read by this user
    if (message.readBy.some(read => read.user.toString() === req.user.id)) {
      return res.status(200).json({
        success: true,
        message: 'Message already marked as read'
      });
    }
    
    // Mark as read
    message.readBy.push({
      user: req.user.id,
      timestamp: new Date()
    });
    
    await message.save();
    
    // Notify sender
    if (message.sender.toString() !== req.user.id) {
      emitToUser(message.sender.toString(), 'message_read', {
        messageId: message._id,
        readBy: req.user.id,
        conversationId: message.conversationId
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    next(error);
  }
};
