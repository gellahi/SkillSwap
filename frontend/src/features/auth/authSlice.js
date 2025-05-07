import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import authService from '../../services/authService'

// Check if user is already logged in
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.checkAuth()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check authentication')
    }
  }
)

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.login(userData)
      toast.success('Login successful')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      toast.success('Registration successful. Please check your email to verify your account.')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

// Verify account
export const verifyAccount = createAsyncThunk(
  'auth/verifyAccount',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authService.verifyAccount(token)
      toast.success('Account verified successfully')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed')
      return rejectWithValue(error.response?.data?.message || 'Verification failed')
    }
  }
)

// Forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email)
      toast.success('Password reset email sent')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email')
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email')
    }
  }
)

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password)
      toast.success('Password reset successful')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed')
      return rejectWithValue(error.response?.data?.message || 'Password reset failed')
    }
  }
)

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      toast.success('Logged out successfully')
      return null
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed')
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Verify Account
      .addCase(verifyAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyAccount.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(verifyAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
  }
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
