import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import messageService from '../../services/messageService'

// Get conversations
export const getConversations = createAsyncThunk(
  'messages/getConversations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await messageService.getConversations(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations')
    }
  }
)

// Get conversation by ID
export const getConversationById = createAsyncThunk(
  'messages/getConversationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await messageService.getConversationById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversation')
    }
  }
)

// Create conversation
export const createConversation = createAsyncThunk(
  'messages/createConversation',
  async (conversationData, { rejectWithValue }) => {
    try {
      const response = await messageService.createConversation(conversationData)
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create conversation')
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation')
    }
  }
)

// Get messages for a conversation
export const getMessages = createAsyncThunk(
  'messages/getMessages',
  async ({ conversationId, params }, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(conversationId, params)
      return { ...response, conversationId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages')
    }
  }
)

// Send message
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(messageData)
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message')
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

// Mark conversation as read
export const markConversationAsRead = createAsyncThunk(
  'messages/markConversationAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await messageService.markConversationAsRead(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark conversation as read')
    }
  }
)

const initialState = {
  conversations: [],
  conversation: null,
  messages: {},
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  }
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessageError: (state) => {
      state.error = null
    },
    clearConversation: (state) => {
      state.conversation = null
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload
      if (state.messages[conversationId]) {
        state.messages[conversationId].push(message)
      } else {
        state.messages[conversationId] = [message]
      }
      
      // Update conversation last message if it's the current conversation
      if (state.conversation && state.conversation._id === conversationId) {
        state.conversation.lastMessage = {
          text: message.text,
          sender: message.sender,
          timestamp: message.createdAt
        }
      }
      
      // Update conversation in the list
      const conversationIndex = state.conversations.findIndex(c => c._id === conversationId)
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = {
          text: message.text,
          sender: message.sender,
          timestamp: message.createdAt
        }
        
        // Move conversation to the top of the list
        const conversation = state.conversations[conversationIndex]
        state.conversations.splice(conversationIndex, 1)
        state.conversations.unshift(conversation)
      }
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Conversations
      .addCase(getConversations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false
        state.conversations = action.payload.conversations
        state.pagination = action.payload.pagination
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get Conversation By ID
      .addCase(getConversationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getConversationById.fulfilled, (state, action) => {
        state.loading = false
        state.conversation = action.payload
      })
      .addCase(getConversationById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create Conversation
      .addCase(createConversation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false
        state.conversation = action.payload
        
        // Check if conversation already exists in the list
        const exists = state.conversations.some(c => c._id === action.payload._id)
        if (!exists) {
          state.conversations.unshift(action.payload)
        }
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get Messages
      .addCase(getMessages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false
        const { conversationId, messages, pagination } = action.payload
        state.messages[conversationId] = messages
        state.pagination = pagination
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false
        const conversationId = action.payload.conversationId
        
        // Add message to the conversation
        if (state.messages[conversationId]) {
          state.messages[conversationId].push(action.payload)
        } else {
          state.messages[conversationId] = [action.payload]
        }
        
        // Update conversation last message if it's the current conversation
        if (state.conversation && state.conversation._id === conversationId) {
          state.conversation.lastMessage = {
            text: action.payload.text,
            sender: action.payload.sender,
            timestamp: action.payload.createdAt
          }
        }
        
        // Update conversation in the list
        const conversationIndex = state.conversations.findIndex(c => c._id === conversationId)
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = {
            text: action.payload.text,
            sender: action.payload.sender,
            timestamp: action.payload.createdAt
          }
          
          // Move conversation to the top of the list
          const conversation = state.conversations[conversationIndex]
          state.conversations.splice(conversationIndex, 1)
          state.conversations.unshift(conversation)
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Mark Conversation as Read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload
        
        // Update conversation in the list
        const conversationIndex = state.conversations.findIndex(c => c._id === conversationId)
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 0
        }
        
        // Update current conversation
        if (state.conversation && state.conversation._id === conversationId) {
          state.conversation.unreadCount = 0
        }
      })
  }
})

export const { clearMessageError, clearConversation, addMessage, setPage } = messagesSlice.actions
export default messagesSlice.reducer
