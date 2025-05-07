import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getConversations, getMessages, sendMessage, markConversationAsRead } from '../../features/messages/messagesSlice';
import { joinConversation, leaveConversation, sendTypingStatus, markMessageAsRead } from '../../services/socketService';

const MessagesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { conversations, conversation, messages, loading } = useSelector(state => state.messages);
  
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  
  // Fetch conversations on component mount
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);
  
  // Handle conversation selection
  useEffect(() => {
    if (selectedConversationId) {
      // Fetch messages for the selected conversation
      dispatch(getMessages({ conversationId: selectedConversationId }));
      
      // Mark conversation as read
      dispatch(markConversationAsRead(selectedConversationId));
      
      // Join the conversation room for real-time updates
      joinConversation(selectedConversationId);
      
      // Clean up when leaving the conversation
      return () => {
        leaveConversation(selectedConversationId);
      };
    }
  }, [dispatch, selectedConversationId]);
  
  // Handle typing status
  useEffect(() => {
    let typingTimeout;
    
    if (selectedConversationId) {
      if (isTyping) {
        // Send typing status to other users
        sendTypingStatus(selectedConversationId, true);
        
        // Clear typing status after 3 seconds of inactivity
        typingTimeout = setTimeout(() => {
          setIsTyping(false);
          sendTypingStatus(selectedConversationId, false);
        }, 3000);
      } else {
        // Send stopped typing status to other users
        sendTypingStatus(selectedConversationId, false);
      }
    }
    
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [selectedConversationId, isTyping]);
  
  // Handle message input change
  const handleMessageChange = (e) => {
    setMessageText(e.target.value);
    
    // Set typing status if not already typing
    if (!isTyping && e.target.value.trim() !== '') {
      setIsTyping(true);
    }
    
    // Set not typing if message is empty
    if (e.target.value.trim() === '') {
      setIsTyping(false);
    }
  };
  
  // Handle message submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (messageText.trim() === '' || !selectedConversationId) return;
    
    // Send message
    dispatch(sendMessage({
      conversationId: selectedConversationId,
      text: messageText
    }));
    
    // Clear message input and typing status
    setMessageText('');
    setIsTyping(false);
  };
  
  // Handle marking a message as read
  const handleMarkAsRead = (messageId) => {
    if (selectedConversationId) {
      markMessageAsRead(selectedConversationId, messageId);
    }
  };
  
  // Render conversation list
  const renderConversations = () => {
    if (loading && conversations.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    if (conversations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <p className="text-gray-500">No conversations yet</p>
          <button
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => {/* Open new conversation modal */}}
          >
            Start a conversation
          </button>
        </div>
      );
    }
    
    return conversations.map(conv => (
      <div
        key={conv._id}
        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
          selectedConversationId === conv._id ? 'bg-primary-50' : ''
        }`}
        onClick={() => setSelectedConversationId(conv._id)}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full"
              src={conv.participants.find(p => p._id !== user?._id)?.profilePicture || `https://ui-avatars.com/api/?name=${conv.participants.find(p => p._id !== user?._id)?.firstName}+${conv.participants.find(p => p._id !== user?._id)?.lastName}`}
              alt={conv.participants.find(p => p._id !== user?._id)?.firstName}
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {conv.title || conv.participants.find(p => p._id !== user?._id)?.firstName}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(conv.lastMessage?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {conv.lastMessage?.text || 'No messages yet'}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <div className="ml-2 bg-primary-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
              {conv.unreadCount}
            </div>
          )}
        </div>
      </div>
    ));
  };
  
  // Render messages for selected conversation
  const renderMessages = () => {
    if (!selectedConversationId) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      );
    }
    
    if (loading && (!messages[selectedConversationId] || messages[selectedConversationId].length === 0)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    if (!messages[selectedConversationId] || messages[selectedConversationId].length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500">No messages yet</p>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col space-y-4 p-4">
        {messages[selectedConversationId].map(message => (
          <div
            key={message._id}
            className={`flex ${message.sender === user?._id ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => handleMarkAsRead(message._id)}
          >
            <div
              className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                message.sender === user?._id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === user?._id ? 'text-primary-100' : 'text-gray-500'
              }`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-200px)]">
        <div className="flex h-full">
          {/* Conversation list */}
          <div className="w-1/3 border-r overflow-y-auto">
            {renderConversations()}
          </div>
          
          {/* Message area */}
          <div className="w-2/3 flex flex-col">
            {/* Message list */}
            <div className="flex-1 overflow-y-auto">
              {renderMessages()}
            </div>
            
            {/* Message input */}
            {selectedConversationId && (
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleMessageChange}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={messageText.trim() === ''}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
