import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from './features/auth/authSlice'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import AuthLayout from './components/layouts/AuthLayout'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyAccountPage from './pages/auth/VerifyAccountPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/projects/ProjectsPage'
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage'
import CreateProjectPage from './pages/projects/CreateProjectPage'
import MyProjectsPage from './pages/projects/MyProjectsPage'
import MyBidsPage from './pages/bids/MyBidsPage'
import MessagesPage from './pages/messages/MessagesPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import ProfilePage from './pages/profile/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth)
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Guest Route Component (redirects if already logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth)
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        } />
        <Route path="/forgot-password" element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        } />
        <Route path="/reset-password" element={
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        } />
        <Route path="/verify-account" element={<VerifyAccountPage />} />
      </Route>
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="create-project" element={<CreateProjectPage />} />
        <Route path="my-projects" element={<MyProjectsPage />} />
        <Route path="my-bids" element={<MyBidsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App
