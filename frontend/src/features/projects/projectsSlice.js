import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import projectService from '../../services/projectService'

// Get all projects
export const getProjects = createAsyncThunk(
  'projects/getProjects',
  async (params, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjects(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects')
    }
  }
)

// Get project by ID
export const getProjectById = createAsyncThunk(
  'projects/getProjectById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectById(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project')
    }
  }
)

// Create project
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await projectService.createProject(projectData)
      toast.success('Project created successfully')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project')
      return rejectWithValue(error.response?.data?.message || 'Failed to create project')
    }
  }
)

// Update project
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await projectService.updateProject(id, projectData)
      toast.success('Project updated successfully')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project')
      return rejectWithValue(error.response?.data?.message || 'Failed to update project')
    }
  }
)

// Delete project
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(id)
      toast.success('Project deleted successfully')
      return id
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project')
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project')
    }
  }
)

// Get client projects
export const getClientProjects = createAsyncThunk(
  'projects/getClientProjects',
  async (params, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth
      const response = await projectService.getProjectsByClientId(user._id, params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch client projects')
    }
  }
)

// Get categories
export const getCategories = createAsyncThunk(
  'projects/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectService.getCategories()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories')
    }
  }
)

const initialState = {
  projects: [],
  project: null,
  categories: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  }
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null
    },
    clearProject: (state) => {
      state.project = null
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Projects
      .addCase(getProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload.projects
        state.pagination = action.payload.pagination
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get Project By ID
      .addCase(getProjectById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.loading = false
        state.project = action.payload
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects.unshift(action.payload)
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false
        state.project = action.payload
        state.projects = state.projects.map(project =>
          project._id === action.payload._id ? action.payload : project
        )
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects = state.projects.filter(project => project._id !== action.payload)
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get Client Projects
      .addCase(getClientProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getClientProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload.projects
        state.pagination = action.payload.pagination
      })
      .addCase(getClientProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get Categories
      .addCase(getCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearProjectError, clearProject, setPage } = projectsSlice.actions
export default projectsSlice.reducer
