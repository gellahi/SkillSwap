import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const response = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        
        // If refresh successful, update token and retry original request
        if (response.data.success) {
          localStorage.setItem('token', response.data.accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
