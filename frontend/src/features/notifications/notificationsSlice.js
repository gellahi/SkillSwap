import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import notificationService from '../../services/notificationService'

// Get notifications
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications')
    }
  }
)

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read')
    }
  }
)

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (params, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read')
    }
  }
)

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification')
    }
  }
)

// Get notification preferences
export const getPreferences = createAsyncThunk(
  'notifications/getPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getPreferences()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notification preferences')
    }
  }
)

// Update notification preferences
export const updatePreferences = createAsyncThunk(
  'notifications/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await notificationService.updatePreferences(preferences)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notification preferences')
    }
  }
)

const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  }
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
        state.pagination = action.payload.pagination
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Mark as Read
      .addCase(markAsRead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false
        
        // Update notification in the list
        const index = state.notifications.findIndex(n => n._id === action.payload._id)
        if (index !== -1) {
          state.notifications[index] = action.payload
          
          // Decrement unread count if notification was unread
          if (!state.notifications[index].isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Mark All as Read
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false
        
        // Mark all notifications as read
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
        
        // Reset unread count
        state.unreadCount = 0
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false
        
        // Find notification to check if it was unread
        const notification = state.notifications.find(n => n._id === action.payload)
        
        // Remove notification from the list
        state.notifications = state.notifications.filter(n => n._id !== action.payload)
        
        // Decrement unread count if notification was unread
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get Preferences
      .addCase(getPreferences.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPreferences.fulfilled, (state, action) => {
        state.loading = false
        state.preferences = action.payload
      })
      .addCase(getPreferences.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update Preferences
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading = false
        state.preferences = action.payload
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearNotificationError, addNotification, setPage } = notificationsSlice.actions
export default notificationsSlice.reducer
