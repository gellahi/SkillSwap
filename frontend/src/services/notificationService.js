import api from './api';

// Get notifications
const getNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/notify?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (id) => {
  try {
    const response = await api.patch(`/notify/${id}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.patch(`/notify/read-all?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete notification
const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notify/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get notification preferences
const getPreferences = async () => {
  try {
    const response = await api.get('/notify/preferences');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update notification preferences
const updatePreferences = async (preferences) => {
  try {
    const response = await api.patch('/notify/preferences', preferences);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset notification preferences
const resetPreferences = async () => {
  try {
    const response = await api.post('/notify/preferences/reset');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  resetPreferences
};

export default notificationService;
