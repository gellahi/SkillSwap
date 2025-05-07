import NotificationPreference from '../models/notification-preference.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';

/**
 * Get notification preferences for current user
 * @route GET /api/notify/preferences
 * @access Private
 */
export const getPreferences = async (req, res, next) => {
  try {
    let preference = await NotificationPreference.findOne({ userId: req.user.id });
    
    // If no preference exists, create default
    if (!preference) {
      preference = new NotificationPreference({ userId: req.user.id });
      await preference.save();
    }
    
    res.status(200).json({
      success: true,
      data: preference
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences
 * @route PATCH /api/notify/preferences
 * @access Private
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const updates = req.body;
    
    let preference = await NotificationPreference.findOne({ userId: req.user.id });
    
    // If no preference exists, create default
    if (!preference) {
      preference = new NotificationPreference({ userId: req.user.id });
    }
    
    // Update email preferences
    if (updates.email) {
      if (updates.email.enabled !== undefined) {
        preference.email.enabled = updates.email.enabled;
      }
      
      if (updates.email.frequency) {
        preference.email.frequency = updates.email.frequency;
      }
      
      if (updates.email.types) {
        Object.keys(updates.email.types).forEach(type => {
          if (preference.email.types[type] !== undefined) {
            preference.email.types[type] = updates.email.types[type];
          }
        });
      }
    }
    
    // Update SMS preferences
    if (updates.sms) {
      if (updates.sms.enabled !== undefined) {
        preference.sms.enabled = updates.sms.enabled;
      }
      
      if (updates.sms.frequency) {
        preference.sms.frequency = updates.sms.frequency;
      }
      
      if (updates.sms.types) {
        Object.keys(updates.sms.types).forEach(type => {
          if (preference.sms.types[type] !== undefined) {
            preference.sms.types[type] = updates.sms.types[type];
          }
        });
      }
    }
    
    // Update in-app preferences
    if (updates.inApp) {
      if (updates.inApp.enabled !== undefined) {
        preference.inApp.enabled = updates.inApp.enabled;
      }
      
      if (updates.inApp.types) {
        Object.keys(updates.inApp.types).forEach(type => {
          if (preference.inApp.types[type] !== undefined) {
            preference.inApp.types[type] = updates.inApp.types[type];
          }
        });
      }
    }
    
    // Update push preferences
    if (updates.push) {
      if (updates.push.enabled !== undefined) {
        preference.push.enabled = updates.push.enabled;
      }
      
      if (updates.push.types) {
        Object.keys(updates.push.types).forEach(type => {
          if (preference.push.types[type] !== undefined) {
            preference.push.types[type] = updates.push.types[type];
          }
        });
      }
    }
    
    // Update do not disturb preferences
    if (updates.doNotDisturb) {
      if (updates.doNotDisturb.enabled !== undefined) {
        preference.doNotDisturb.enabled = updates.doNotDisturb.enabled;
      }
      
      if (updates.doNotDisturb.startTime) {
        preference.doNotDisturb.startTime = updates.doNotDisturb.startTime;
      }
      
      if (updates.doNotDisturb.endTime) {
        preference.doNotDisturb.endTime = updates.doNotDisturb.endTime;
      }
      
      if (updates.doNotDisturb.timezone) {
        preference.doNotDisturb.timezone = updates.doNotDisturb.timezone;
      }
    }
    
    // Save updated preferences
    await preference.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preference
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset notification preferences to default
 * @route POST /api/notify/preferences/reset
 * @access Private
 */
export const resetPreferences = async (req, res, next) => {
  try {
    // Delete existing preferences
    await NotificationPreference.deleteOne({ userId: req.user.id });
    
    // Create new default preferences
    const preference = new NotificationPreference({ userId: req.user.id });
    await preference.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification preferences reset to default',
      data: preference
    });
  } catch (error) {
    next(error);
  }
};
