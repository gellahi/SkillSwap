import { io } from 'socket.io-client';
import { store } from '../features/store';
import { addMessage } from '../features/messages/messagesSlice';
import { addNotification } from '../features/notifications/notificationsSlice';

let socket = null;

/**
 * Initialize Socket.io connection
 * @returns {Object|null} Socket.io client instance or null if initialization failed
 */
export const initializeSocket = () => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('Cannot initialize socket: No authentication token found');
    return null;
  }
  
  // Create socket connection
  socket = io('/', {
    auth: {
      token
    }
  });
  
  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  // Message events
  socket.on('new_message', (data) => {
    store.dispatch(addMessage({
      conversationId: data.message.conversationId,
      message: data.message
    }));
  });
  
  // Typing status events
  socket.on('typing_status', (data) => {
    // Handle typing status updates
    const { userId, conversationId, isTyping } = data;
    
    // You can dispatch an action to update the typing status in your Redux store
    // For example:
    // store.dispatch(updateTypingStatus({ userId, conversationId, isTyping }));
  });
  
  // Read receipt events
  socket.on('message_read', (data) => {
    // Handle read receipts
    const { userId, conversationId, messageId, timestamp } = data;
    
    // You can dispatch an action to update the read status in your Redux store
    // For example:
    // store.dispatch(updateReadStatus({ userId, conversationId, messageId, timestamp }));
  });
  
  // Notification events
  socket.on('notification', (data) => {
    store.dispatch(addNotification(data));
  });
  
  // Bid events
  socket.on('new_bid', (data) => {
    // Handle new bid notifications
    // You can dispatch an action to update the bids in your Redux store
    // For example:
    // store.dispatch(addBid(data.bid));
  });
  
  // Project update events
  socket.on('project_update', (data) => {
    // Handle project update notifications
    // You can dispatch an action to update the project in your Redux store
    // For example:
    // store.dispatch(updateProject(data.project));
  });
  
  return socket;
};

/**
 * Join a conversation room
 * @param {string} conversationId - Conversation ID
 */
export const joinConversation = (conversationId) => {
  if (!socket) return;
  socket.emit('join-conversation', conversationId);
};

/**
 * Leave a conversation room
 * @param {string} conversationId - Conversation ID
 */
export const leaveConversation = (conversationId) => {
  if (!socket) return;
  socket.emit('leave-conversation', conversationId);
};

/**
 * Send typing status
 * @param {string} conversationId - Conversation ID
 * @param {boolean} isTyping - Whether the user is typing
 */
export const sendTypingStatus = (conversationId, isTyping) => {
  if (!socket) return;
  socket.emit('typing', { conversationId, isTyping });
};

/**
 * Mark a message as read
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 */
export const markMessageAsRead = (conversationId, messageId) => {
  if (!socket) return;
  socket.emit('mark_read', { conversationId, messageId });
};

/**
 * Join a project room
 * @param {string} projectId - Project ID
 */
export const joinProject = (projectId) => {
  if (!socket) return;
  socket.emit('join-project', projectId);
};

/**
 * Leave a project room
 * @param {string} projectId - Project ID
 */
export const leaveProject = (projectId) => {
  if (!socket) return;
  socket.emit('leave-project', projectId);
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get socket instance
 * @returns {Object|null} Socket.io client instance or null if not initialized
 */
export const getSocket = () => socket;

export default {
  initializeSocket,
  joinConversation,
  leaveConversation,
  sendTypingStatus,
  markMessageAsRead,
  joinProject,
  leaveProject,
  disconnectSocket,
  getSocket
};
