import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import projectsReducer from './projects/projectsSlice'
import bidsReducer from './bids/bidsSlice'
import messagesReducer from './messages/messagesSlice'
import notificationsReducer from './notifications/notificationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    bids: bidsReducer,
    messages: messagesReducer,
    notifications: notificationsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
