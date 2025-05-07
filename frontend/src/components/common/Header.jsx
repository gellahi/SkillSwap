import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { logout } from '../../features/auth/authSlice';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <img
                      className="block h-8 w-auto"
                      src="/logo.svg"
                      alt="SkillSwap"
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/projects"
                    className="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Projects
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link
                        to="/dashboard"
                        className="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/messages"
                        className="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      >
                        Messages
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {isAuthenticated ? (
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <Link
                      to="/notifications"
                      className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                      )}
                    </Link>

                    {/* Profile dropdown */}
                    <Menu as="div" className="ml-3 relative">
                      <div>
                        <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user?.profilePicture || "https://ui-avatars.com/api/?name=" + user?.firstName + "+" + user?.lastName}
                            alt={user?.firstName}
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } block px-4 py-2 text-sm text-gray-700`}
                              >
                                Your Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                ) : (
                  <div className="hidden sm:flex sm:items-center sm:ml-6 sm:space-x-4">
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
                
                {/* Mobile menu button */}
                <div className="flex items-center sm:hidden">
                  <Disclosure.Button 
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Disclosure.Button
                as={Link}
                to="/"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                Home
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                to="/projects"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                Projects
              </Disclosure.Button>
              {isAuthenticated ? (
                <>
                  <Disclosure.Button
                    as={Link}
                    to="/dashboard"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  >
                    Dashboard
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/messages"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  >
                    Messages
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/notifications"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  >
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {unreadCount}
                      </span>
                    )}
                  </Disclosure.Button>
                </>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-4 space-x-3">
                    <Link
                      to="/login"
                      className="block text-base font-medium text-primary-600 hover:text-primary-500"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user?.profilePicture || "https://ui-avatars.com/api/?name=" + user?.firstName + "+" + user?.lastName}
                      alt={user?.firstName}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Your Profile
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header;
