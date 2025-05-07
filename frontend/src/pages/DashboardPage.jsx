import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProjects } from '../features/projects/projectsSlice';
import { getFreelancerBids } from '../features/bids/bidsSlice';
import { getNotifications } from '../features/notifications/notificationsSlice';
import DashboardAnalytics from '../components/dashboard/DashboardAnalytics';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { projects } = useSelector(state => state.projects);
  const { bids } = useSelector(state => state.bids);
  const { notifications } = useSelector(state => state.notifications);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  useEffect(() => {
    if (user) {
      if (user.role === 'client') {
        dispatch(getProjects({ clientId: user._id, limit: 5 }));
      } else if (user.role === 'freelancer') {
        dispatch(getFreelancerBids({ freelancerId: user._id, limit: 5 }));
      }
      dispatch(getNotifications({ limit: 5 }));
    }
  }, [dispatch, user]);
  
  const renderStats = () => {
    if (user?.role === 'client') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Projects</h3>
            <p className="text-3xl font-bold text-primary-600">
              {projects?.filter(p => p.status === 'active').length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Bids Received</h3>
            <p className="text-3xl font-bold text-secondary-600">
              {projects?.reduce((acc, p) => acc + (p.bidCount || 0), 0) || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Completed Projects</h3>
            <p className="text-3xl font-bold text-green-600">
              {projects?.filter(p => p.status === 'completed').length || 0}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Bids</h3>
            <p className="text-3xl font-bold text-primary-600">
              {bids?.filter(b => b.status === 'pending').length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Won Projects</h3>
            <p className="text-3xl font-bold text-green-600">
              {bids?.filter(b => b.status === 'accepted').length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-secondary-600">
              {bids?.length > 0
                ? Math.round(
                    (bids.filter(b => b.status === 'completed').length / bids.length) * 100
                  )
                : 0}%
            </p>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome back, {user?.firstName}!</h2>
        <p className="text-gray-600">
          Here's an overview of your {user?.role === 'client' ? 'projects' : 'bids'} and recent activity.
        </p>
      </div>
      
      {renderStats()}
      
      {showAnalytics && (
        <div className="mb-8">
          <DashboardAnalytics />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {user?.role === 'client' ? 'Recent Projects' : 'Recent Bids'}
            </h3>
            <Link
              to={user?.role === 'client' ? '/my-projects' : '/my-bids'}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {user?.role === 'client' ? (
              projects?.length > 0 ? (
                projects.slice(0, 5).map(project => (
                  <div key={project._id} className="px-6 py-4">
                    <Link to={`/projects/${project._id}`} className="block hover:bg-gray-50">
                      <h4 className="text-base font-medium text-gray-900">{project.title}</h4>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm text-gray-500">
                          {project.bidCount} {project.bidCount === 1 ? 'bid' : 'bids'}
                        </span>
                        <span className={`text-sm ${
                          project.status === 'active' ? 'text-green-600' : 
                          project.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  No projects found. <Link to="/create-project" className="text-primary-600 hover:text-primary-500">Create one now</Link>
                </div>
              )
            ) : (
              bids?.length > 0 ? (
                bids.slice(0, 5).map(bid => (
                  <div key={bid._id} className="px-6 py-4">
                    <Link to={`/projects/${bid.projectId}`} className="block hover:bg-gray-50">
                      <h4 className="text-base font-medium text-gray-900">{bid.projectTitle}</h4>
                      <p className="mt-1 text-sm text-gray-600">Your bid: ${bid.amount}</p>
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm text-gray-500">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`text-sm ${
                          bid.status === 'accepted' ? 'text-green-600' : 
                          bid.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  No bids found. <Link to="/projects" className="text-primary-600 hover:text-primary-500">Browse projects</Link>
                </div>
              )
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
            <Link
              to="/notifications"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {notifications?.length > 0 ? (
              notifications.slice(0, 5).map(notification => (
                <div key={notification._id} className="px-6 py-4">
                  <div className={`${notification.isRead ? '' : 'bg-primary-50'} hover:bg-gray-50 p-2 rounded`}>
                    <h4 className="text-base font-medium text-gray-900">{notification.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No notifications found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
