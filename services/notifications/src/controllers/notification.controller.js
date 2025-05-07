import Notification from '../models/notification.model.js';
import NotificationPreference from '../models/notification-preference.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';
import { emitToUser } from '../utils/socket.js';
import { sendEmail } from '../utils/email.js';
import { sendSMS } from '../utils/sms.js';
import axios from 'axios';

/**
 * Send in-app notification
 * @route POST /api/notify/in-app
 * @access Private
 */
export const sendInAppNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type, data } = req.body;
    
    // Check if user exists
    try {
      // In a real implementation, we would validate user with Auth Service
      // For now, we'll skip this step
    } catch (error) {
      throw new ApiError(404, 'User not found');
    }
    
    // Check user notification preferences
    let preference = await NotificationPreference.findOne({ userId });
    
    // If no preference exists, create default
    if (!preference) {
      preference = new NotificationPreference({ userId });
      await preference.save();
    }
    
    // Check if user has enabled in-app notifications for this type
    if (!preference.inApp.enabled || 
        (type && preference.inApp.types[type] === false)) {
      return res.status(200).json({
        success: true,
        message: 'Notification not sent - user has disabled this notification type',
        data: null
      });
    }
    
    // Create notification
    const notification = new Notification({
      userId,
      title,
      message,
      type: type || 'other',
      data: data || {},
      channel: 'in-app',
      status: 'pending'
    });
    
    // Save notification
    await notification.save();
    
    // Send real-time notification via Socket.io
    emitToUser(userId, 'notification', {
      _id: notification._id,
      title,
      message,
      type: type || 'other',
      createdAt: notification.createdAt
    });
    
    // Update notification status
    notification.status = 'sent';
    notification.sentAt = new Date();
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'In-app notification sent successfully',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send email notification
 * @route POST /api/notify/email
 * @access Private
 */
export const sendEmailNotification = async (req, res, next) => {
  try {
    const { userId, subject, message, type, data, template } = req.body;
    
    // Get user email from Auth Service
    let userEmail;
    try {
      // In a real implementation, we would get user email from Auth Service
      // For now, we'll use a mock email
      userEmail = 'user@example.com';
    } catch (error) {
      throw new ApiError(404, 'User not found');
    }
    
    // Check user notification preferences
    let preference = await NotificationPreference.findOne({ userId });
    
    // If no preference exists, create default
    if (!preference) {
      preference = new NotificationPreference({ userId });
      await preference.save();
    }
    
    // Check if user has enabled email notifications for this type
    if (!preference.email.enabled || 
        (type && preference.email.types[type] === false)) {
      return res.status(200).json({
        success: true,
        message: 'Email notification not sent - user has disabled this notification type',
        data: null
      });
    }
    
    // Check if user is in do not disturb mode
    if (preference.doNotDisturb.enabled) {
      const now = new Date();
      const userTimezone = preference.doNotDisturb.timezone || 'Asia/Karachi';
      
      // Convert current time to user's timezone
      const userTime = now.toLocaleTimeString('en-US', { timeZone: userTimezone, hour12: false });
      
      // Parse start and end times
      const startTime = preference.doNotDisturb.startTime;
      const endTime = preference.doNotDisturb.endTime;
      
      // Check if current time is within do not disturb period
      if (userTime >= startTime || userTime <= endTime) {
        // Create notification but mark it for delayed delivery
        const notification = new Notification({
          userId,
          title: subject,
          message,
          type: type || 'other',
          data: data || {},
          channel: 'email',
          status: 'pending'
        });
        
        await notification.save();
        
        return res.status(200).json({
          success: true,
          message: 'Email notification scheduled - user is in do not disturb mode',
          data: notification
        });
      }
    }
    
    // Create notification
    const notification = new Notification({
      userId,
      title: subject,
      message,
      type: type || 'other',
      data: data || {},
      channel: 'email',
      status: 'pending'
    });
    
    // Save notification
    await notification.save();
    
    // Send email
    try {
      await sendEmail({
        to: userEmail,
        subject,
        text: message,
        html: template || `<p>${message}</p>`,
        data: data || {}
      });
      
      // Update notification status
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
      
      res.status(201).json({
        success: true,
        message: 'Email notification sent successfully',
        data: notification
      });
    } catch (error) {
      // Update notification status
      notification.status = 'failed';
      notification.failedAt = new Date();
      notification.failureReason = error.message;
      await notification.save();
      
      throw new ApiError(500, `Failed to send email: ${error.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Send SMS notification
 * @route POST /api/notify/sms
 * @access Private
 */
export const sendSMSNotification = async (req, res, next) => {
  try {
    const { userId, message, type, data } = req.body;
    
    // Get user phone number from Auth Service
    let userPhone;
    try {
      // In a real implementation, we would get user phone from Auth Service
      // For now, we'll use a mock phone number
      userPhone = '+923001234567';
    } catch (error) {
      throw new ApiError(404, 'User not found');
    }
    
    // Check user notification preferences
    let preference = await NotificationPreference.findOne({ userId });
    
    // If no preference exists, create default
    if (!preference) {
      preference = new NotificationPreference({ userId });
      await preference.save();
    }
    
    // Check if user has enabled SMS notifications for this type
    if (!preference.sms.enabled || 
        (type && preference.sms.types[type] === false)) {
      return res.status(200).json({
        success: true,
        message: 'SMS notification not sent - user has disabled this notification type',
        data: null
      });
    }
    
    // Check if user is in do not disturb mode
    if (preference.doNotDisturb.enabled) {
      const now = new Date();
      const userTimezone = preference.doNotDisturb.timezone || 'Asia/Karachi';
      
      // Convert current time to user's timezone
      const userTime = now.toLocaleTimeString('en-US', { timeZone: userTimezone, hour12: false });
      
      // Parse start and end times
      const startTime = preference.doNotDisturb.startTime;
      const endTime = preference.doNotDisturb.endTime;
      
      // Check if current time is within do not disturb period
      if (userTime >= startTime || userTime <= endTime) {
        // Create notification but mark it for delayed delivery
        const notification = new Notification({
          userId,
          title: 'SMS Notification',
          message,
          type: type || 'other',
          data: data || {},
          channel: 'sms',
          status: 'pending'
        });
        
        await notification.save();
        
        return res.status(200).json({
          success: true,
          message: 'SMS notification scheduled - user is in do not disturb mode',
          data: notification
        });
      }
    }
    
    // Create notification
    const notification = new Notification({
      userId,
      title: 'SMS Notification',
      message,
      type: type || 'other',
      data: data || {},
      channel: 'sms',
      status: 'pending'
    });
    
    // Save notification
    await notification.save();
    
    // Send SMS
    try {
      await sendSMS({
        to: userPhone,
        message
      });
      
      // Update notification status
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
      
      res.status(201).json({
        success: true,
        message: 'SMS notification sent successfully',
        data: notification
      });
    } catch (error) {
      // Update notification status
      notification.status = 'failed';
      notification.failedAt = new Date();
      notification.failureReason = error.message;
      await notification.save();
      
      throw new ApiError(500, `Failed to send SMS: ${error.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get notifications for current user
 * @route GET /api/notify
 * @access Private
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;
    
    // Build query
    const query = { 
      userId: req.user.id,
      channel: 'in-app'
    };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    if (type) {
      query.type = type;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Notification.countDocuments(query);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      channel: 'in-app',
      isRead: false
    });
    
    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
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
 * Mark notification as read
 * @route PATCH /api/notify/:id/read
 * @access Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    
    // Check if user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to access this notification');
    }
    
    // Check if already read
    if (notification.isRead) {
      return res.status(200).json({
        success: true,
        message: 'Notification already marked as read'
      });
    }
    
    // Mark as read
    notification.isRead = true;
    notification.readAt = new Date();
    
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notify/read-all
 * @access Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    // Build query
    const query = { 
      userId: req.user.id,
      channel: 'in-app',
      isRead: false
    };
    
    if (type) {
      query.type = type;
    }
    
    // Update all matching notifications
    const result = await Notification.updateMany(query, {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    });
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 * @route DELETE /api/notify/:id
 * @access Private
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    
    // Check if user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You are not authorized to delete this notification');
    }
    
    // Delete notification
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
