import api from './api';

// Get conversations
const getConversations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/messages/conversations?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get conversation by ID
const getConversationById = async (id) => {
  try {
    const response = await api.get(`/messages/conversations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create conversation
const createConversation = async (conversationData) => {
  try {
    const response = await api.post('/messages/conversations', conversationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update conversation
const updateConversation = async (id, conversationData) => {
  try {
    const response = await api.patch(`/messages/conversations/${id}`, conversationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Leave conversation
const leaveConversation = async (id) => {
  try {
    const response = await api.patch(`/messages/conversations/${id}/leave`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark conversation as read
const markConversationAsRead = async (id) => {
  try {
    const response = await api.patch(`/messages/conversations/${id}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get messages for a conversation
const getMessages = async (conversationId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/messages/conversations/${conversationId}/messages?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Send message
const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/messages', messageData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Edit message
const editMessage = async (id, messageData) => {
  try {
    const response = await api.patch(`/messages/${id}`, messageData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete message
const deleteMessage = async (id) => {
  try {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark message as read
const markMessageAsRead = async (id) => {
  try {
    const response = await api.patch(`/messages/${id}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const messageService = {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  leaveConversation,
  markConversationAsRead,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markMessageAsRead
};

export default messageService;
