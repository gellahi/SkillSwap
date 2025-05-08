import api from './api';

// Check if user is authenticated
const checkAuth = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
const login = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);

    // Save token to localStorage
    if (response.accessToken) {
      localStorage.setItem('token', response.accessToken);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Register user
const register = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify account
const verifyAccount = async (token) => {
  try {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forgot password
const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password
const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/auth/reset-password/verify', { token, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
const logout = async () => {
  try {
    const response = await api.post('/auth/logout');

    // Remove token from localStorage
    localStorage.removeItem('token');

    return response.data;
  } catch (error) {
    // Remove token even if logout fails
    localStorage.removeItem('token');
    throw error;
  }
};

// Update profile
const updateProfile = async (userData) => {
  try {
    const response = await api.patch('/auth/profile', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change password
const changePassword = async (passwordData) => {
  try {
    const response = await api.patch('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Resend verification email
const resendVerification = async () => {
  try {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const authService = {
  checkAuth,
  login,
  register,
  verifyAccount,
  forgotPassword,
  resetPassword,
  logout,
  updateProfile,
  changePassword,
  resendVerification
};

export default authService;
