import api from './api';

// Get all projects with optional filters
const getProjects = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/projects?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get project by ID
const getProjectById = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create project
const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update project
const updateProject = async (id, projectData) => {
  try {
    const response = await api.patch(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete project
const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get projects by client ID
const getProjectsByClientId = async (clientId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/projects/client/${clientId}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get categories
const getCategories = async () => {
  try {
    const response = await api.get('/projects/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get category by ID
const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/projects/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const projectService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByClientId,
  getCategories,
  getCategoryById
};

export default projectService;
