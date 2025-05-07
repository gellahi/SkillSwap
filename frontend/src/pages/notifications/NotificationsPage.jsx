import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  getPreferences,
  updatePreferences
} from '../../features/notifications/notificationsSlice';
import { BellIcon, TrashIcon, CheckIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, preferences, loading, pagination } = useSelector(state => state.notifications);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferencesForm, setPreferencesForm] = useState({
    email: {
      enabled: true,
      types: {
        message: true,
        bid: true,
        project: true,
        system: true
      }
    },
    inApp: {
      enabled: true,
      types: {
        message: true,
        bid: true,
        project: true,
        system: true
      }
    }
  });
  
  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(getNotifications());
    dispatch(getPreferences());
  }, [dispatch]);
  
  // Update preferences form when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setPreferencesForm(preferences);
    }
  }, [preferences]);
  
  // Handle marking a notification as read
  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  // Handle deleting a notification
  const handleDeleteNotification = (id) => {
    dispatch(deleteNotification(id));
  };
  
  // Handle preference form changes
  const handlePreferenceChange = (channel, field, value) => {
    if (field === 'enabled') {
      setPreferencesForm(prev => ({
        ...prev,
        [channel]: {
          ...prev[channel],
          enabled: value
        }
      }));
    } else {
      setPreferencesForm(prev => ({
        ...prev,
        [channel]: {
          ...prev[channel],
          types: {
            ...prev[channel].types,
            [field]: value
          }
        }
      }));
    }
  };
  
  // Handle saving preferences
  const handleSavePreferences = () => {
    dispatch(updatePreferences(preferencesForm));
    setShowPreferences(false);
  };
  
  // Handle loading more notifications
  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      dispatch(getNotifications({ page: pagination.page + 1 }));
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'bid':
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'project':
        return (
          <div className="bg-purple-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <BellIcon className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };
  
  // Render notification list
  const renderNotifications = () => {
    if (loading && notifications.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <BellIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      );
    }
    
    return (
      <div className="divide-y divide-gray-200">
        {notifications.map(notification => (
          <div 
            key={notification._id} 
            className={`p-4 ${notification.isRead ? 'bg-white' : 'bg-primary-50'} hover:bg-gray-50`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div 
                  className="cursor-pointer"
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="mr-2 bg-primary-100 p-1 rounded-full text-primary-600 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Mark as read</span>
                    <CheckIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notification._id)}
                  className="bg-red-100 p-1 rounded-full text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <span className="sr-only">Delete</span>
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {pagination.page < pagination.pages && (
          <div className="p-4 text-center">
            <button
              onClick={handleLoadMore}
              className="text-primary-600 hover:text-primary-800 font-medium focus:outline-none"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Render notification preferences
  const renderPreferences = () => {
    if (!preferences) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    return (
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-6">
          {/* Email Notifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-medium text-gray-900">Email Notifications</h4>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={preferencesForm.email.enabled}
                    onChange={(e) => handlePreferenceChange('email', 'enabled', e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${preferencesForm.email.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${preferencesForm.email.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
            
            <div className="ml-4 space-y-2">
              {Object.entries(preferencesForm.email.types).map(([type, enabled]) => (
                <div key={type} className="flex items-center">
                  <input
                    id={`email-${type}`}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={enabled}
                    onChange={(e) => handlePreferenceChange('email', type, e.target.checked)}
                    disabled={!preferencesForm.email.enabled}
                  />
                  <label htmlFor={`email-${type}`} className="ml-2 block text-sm text-gray-700">
                    {type.charAt(0).toUpperCase() + type.slice(1)} notifications
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* In-App Notifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-medium text-gray-900">In-App Notifications</h4>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={preferencesForm.inApp.enabled}
                    onChange={(e) => handlePreferenceChange('inApp', 'enabled', e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${preferencesForm.inApp.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${preferencesForm.inApp.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
            
            <div className="ml-4 space-y-2">
              {Object.entries(preferencesForm.inApp.types).map(([type, enabled]) => (
                <div key={type} className="flex items-center">
                  <input
                    id={`inApp-${type}`}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={enabled}
                    onChange={(e) => handlePreferenceChange('inApp', type, e.target.checked)}
                    disabled={!preferencesForm.inApp.enabled}
                  />
                  <label htmlFor={`inApp-${type}`} className="ml-2 block text-sm text-gray-700">
                    {type.charAt(0).toUpperCase() + type.slice(1)} notifications
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setShowPreferences(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Save
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Mark all as read
          </button>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Preferences
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {showPreferences ? renderPreferences() : renderNotifications()}
      </div>
    </div>
  );
};

export default NotificationsPage;
