import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import bidService from '../../services/bidService'

// Get bids for a project
export const getProjectBids = createAsyncThunk(
  'bids/getProjectBids',
  async ({ projectId, params }, { rejectWithValue }) => {
    try {
      const response = await bidService.getProjectBids(projectId, params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bids')
    }
  }
)

// Get bids by freelancer
export const getFreelancerBids = createAsyncThunk(
  'bids/getFreelancerBids',
  async ({ freelancerId, params }, { rejectWithValue }) => {
    try {
      const response = await bidService.getFreelancerBids(freelancerId, params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bids')
    }
  }
)

// Get bid by ID
export const getBidById = createAsyncThunk(
  'bids/getBidById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bidService.getBidById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bid')
    }
  }
)

// Create bid
export const createBid = createAsyncThunk(
  'bids/createBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await bidService.createBid(bidData)
      toast.success('Bid submitted successfully')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit bid')
      return rejectWithValue(error.response?.data?.message || 'Failed to submit bid')
    }
  }
)

// Update bid
export const updateBid = createAsyncThunk(
  'bids/updateBid',
  async ({ id, bidData }, { rejectWithValue }) => {
    try {
      const response = await bidService.updateBid(id, bidData)
      toast.success('Bid updated successfully')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bid')
      return rejectWithValue(error.response?.data?.message || 'Failed to update bid')
    }
  }
)

// Withdraw bid
export const withdrawBid = createAsyncThunk(
  'bids/withdrawBid',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bidService.withdrawBid(id)
      toast.success('Bid withdrawn successfully')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw bid')
      return rejectWithValue(error.response?.data?.message || 'Failed to withdraw bid')
    }
  }
)

// Accept bid
export const acceptBid = createAsyncThunk(
  'bids/acceptBid',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bidService.acceptBid(id)
      toast.success('Bid accepted successfully')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept bid')
      return rejectWithValue(error.response?.data?.message || 'Failed to accept bid')
    }
  }
)

// Reject bid
export const rejectBid = createAsyncThunk(
  'bids/rejectBid',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bidService.rejectBid(id)
      toast.success('Bid rejected successfully')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject bid')
      return rejectWithValue(error.response?.data?.message || 'Failed to reject bid')
    }
  }
)

const initialState = {
  bids: [],
  bid: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  }
}

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    clearBidError: (state) => {
      state.error = null
    },
    clearBid: (state) => {
      state.bid = null
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Project Bids
      .addCase(getProjectBids.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProjectBids.fulfilled, (state, action) => {
        state.loading = false
        state.bids = action.payload.bids
        state.pagination = action.payload.pagination
      })
      .addCase(getProjectBids.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get Freelancer Bids
      .addCase(getFreelancerBids.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getFreelancerBids.fulfilled, (state, action) => {
        state.loading = false
        state.bids = action.payload.bids
        state.pagination = action.payload.pagination
      })
      .addCase(getFreelancerBids.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Get Bid By ID
      .addCase(getBidById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBidById.fulfilled, (state, action) => {
        state.loading = false
        state.bid = action.payload
      })
      .addCase(getBidById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create Bid
      .addCase(createBid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.loading = false
        state.bids.unshift(action.payload)
      })
      .addCase(createBid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update Bid
      .addCase(updateBid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBid.fulfilled, (state, action) => {
        state.loading = false
        state.bid = action.payload
        state.bids = state.bids.map(bid => 
          bid._id === action.payload._id ? action.payload : bid
        )
      })
      .addCase(updateBid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Withdraw Bid
      .addCase(withdrawBid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(withdrawBid.fulfilled, (state, action) => {
        state.loading = false
        state.bid = action.payload
        state.bids = state.bids.map(bid => 
          bid._id === action.payload._id ? action.payload : bid
        )
      })
      .addCase(withdrawBid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Accept Bid
      .addCase(acceptBid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(acceptBid.fulfilled, (state, action) => {
        state.loading = false
        state.bid = action.payload
        state.bids = state.bids.map(bid => 
          bid._id === action.payload._id ? action.payload : bid
        )
      })
      .addCase(acceptBid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Reject Bid
      .addCase(rejectBid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rejectBid.fulfilled, (state, action) => {
        state.loading = false
        state.bid = action.payload
        state.bids = state.bids.map(bid => 
          bid._id === action.payload._id ? action.payload : bid
        )
      })
      .addCase(rejectBid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearBidError, clearBid, setPage } = bidsSlice.actions
export default bidsSlice.reducer
