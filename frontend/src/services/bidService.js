import api from './api';

// Get bids for a project
const getProjectBids = async (projectId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/bids/project/${projectId}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get bids by freelancer
const getFreelancerBids = async (freelancerId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/bids/freelancer/${freelancerId}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get bid by ID
const getBidById = async (id) => {
  try {
    const response = await api.get(`/bids/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create bid
const createBid = async (bidData) => {
  try {
    const response = await api.post('/bids', bidData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update bid
const updateBid = async (id, bidData) => {
  try {
    const response = await api.patch(`/bids/${id}`, bidData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Withdraw bid
const withdrawBid = async (id) => {
  try {
    const response = await api.patch(`/bids/${id}/withdraw`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Accept bid
const acceptBid = async (id) => {
  try {
    const response = await api.patch(`/bids/${id}/accept`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reject bid
const rejectBid = async (id) => {
  try {
    const response = await api.patch(`/bids/${id}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create counter offer
const createCounterOffer = async (bidId, counterOfferData) => {
  try {
    const response = await api.post(`/bids/${bidId}/counter-offer`, counterOfferData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Accept counter offer
const acceptCounterOffer = async (bidId, counterOfferId) => {
  try {
    const response = await api.patch(`/bids/${bidId}/counter-offer/${counterOfferId}/accept`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reject counter offer
const rejectCounterOffer = async (bidId, counterOfferId) => {
  try {
    const response = await api.patch(`/bids/${bidId}/counter-offer/${counterOfferId}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add milestone
const addMilestone = async (bidId, milestoneData) => {
  try {
    const response = await api.post(`/bids/${bidId}/milestones`, milestoneData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update milestone
const updateMilestone = async (bidId, milestoneId, milestoneData) => {
  try {
    const response = await api.patch(`/bids/${bidId}/milestones/${milestoneId}`, milestoneData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete milestone
const deleteMilestone = async (bidId, milestoneId) => {
  try {
    const response = await api.delete(`/bids/${bidId}/milestones/${milestoneId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update milestone status
const updateMilestoneStatus = async (bidId, milestoneId, status) => {
  try {
    const response = await api.patch(`/bids/${bidId}/milestones/${milestoneId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add client feedback
const addClientFeedback = async (bidId, feedbackData) => {
  try {
    const response = await api.post(`/bids/${bidId}/feedback/client`, feedbackData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add freelancer feedback
const addFreelancerFeedback = async (bidId, feedbackData) => {
  try {
    const response = await api.post(`/bids/${bidId}/feedback/freelancer`, feedbackData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get feedback
const getFeedback = async (bidId) => {
  try {
    const response = await api.get(`/bids/${bidId}/feedback`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const bidService = {
  getProjectBids,
  getFreelancerBids,
  getBidById,
  createBid,
  updateBid,
  withdrawBid,
  acceptBid,
  rejectBid,
  createCounterOffer,
  acceptCounterOffer,
  rejectCounterOffer,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  updateMilestoneStatus,
  addClientFeedback,
  addFreelancerFeedback,
  getFeedback
};

export default bidService;
