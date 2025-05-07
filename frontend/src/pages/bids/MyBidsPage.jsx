import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getFreelancerBids, withdrawBid } from '../../features/bids/bidsSlice';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const MyBidsPage = () => {
  const dispatch = useDispatch();
  const { bids, loading } = useSelector(state => state.bids);
  const [activeTab, setActiveTab] = useState('all');
  const [bidToWithdraw, setBidToWithdraw] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  useEffect(() => {
    dispatch(getFreelancerBids());
  }, [dispatch]);
  
  const handleWithdrawClick = (bid) => {
    setBidToWithdraw(bid);
    setShowWithdrawModal(true);
  };
  
  const confirmWithdraw = () => {
    if (bidToWithdraw) {
      dispatch(withdrawBid(bidToWithdraw._id))
        .unwrap()
        .then(() => {
          setShowWithdrawModal(false);
          setBidToWithdraw(null);
        })
        .catch(error => {
          console.error('Failed to withdraw bid:', error);
        });
    }
  };
  
  const cancelWithdraw = () => {
    setShowWithdrawModal(false);
    setBidToWithdraw(null);
  };
  
  const filteredBids = activeTab === 'all' 
    ? bids 
    : bids?.filter(bid => bid.status === activeTab);
  
  // Placeholder bids for UI development
  const placeholderBids = [
    {
      _id: '1',
      amount: 1200,
      deliveryTime: '10 days',
      message: 'I have extensive experience in e-commerce development and can deliver a high-quality solution within your timeframe.',
      status: 'pending',
      createdAt: '2023-05-16T10:30:00Z',
      project: {
        _id: 'p1',
        title: 'Modern E-commerce Website Development',
        budget: 1500,
        client: {
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    },
    {
      _id: '2',
      amount: 750,
      deliveryTime: '7 days',
      message: 'I specialize in UI/UX design for mobile applications and can create intuitive interfaces for your fitness app.',
      status: 'accepted',
      createdAt: '2023-05-19T14:45:00Z',
      project: {
        _id: 'p2',
        title: 'Mobile App UI/UX Design',
        budget: 800,
        client: {
          firstName: 'Jane',
          lastName: 'Smith'
        }
      }
    },
    {
      _id: '3',
      amount: 450,
      deliveryTime: '5 days',
      message: 'As a tech writer with 5+ years of experience, I can deliver engaging content that will resonate with your audience.',
      status: 'rejected',
      createdAt: '2023-05-21T09:15:00Z',
      project: {
        _id: 'p3',
        title: 'Content Writing for Tech Blog',
        budget: 500,
        client: {
          firstName: 'Robert',
          lastName: 'Johnson'
        }
      }
    }
  ];
  
  // Use placeholder bids if real data is not available
  const displayBids = bids?.length > 0 ? filteredBids : placeholderBids;
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="mr-1 h-3 w-3" />
            Rejected
          </span>
        );
      case 'withdrawn':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bids</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Bids
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'accepted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'rejected'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rejected
            </button>
          </nav>
        </div>
        
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : displayBids?.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {displayBids.map(bid => (
              <div key={bid._id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h2 className="text-lg font-medium text-gray-900 mr-3">
                        <Link to={`/projects/${bid.project?._id}`} className="hover:text-primary-600">
                          {bid.project?.title}
                        </Link>
                      </h2>
                      {getStatusBadge(bid.status)}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {bid.message}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500">
                      <span className="mr-4">Your Bid: ${bid.amount}</span>
                      <span className="mr-4">Project Budget: ${bid.project?.budget}</span>
                      <span className="mr-4">Delivery: {bid.deliveryTime}</span>
                      <span>
                        Submitted: {new Date(bid.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Client: {bid.project?.client?.firstName} {bid.project?.client?.lastName}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <Link
                      to={`/projects/${bid.project?._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View Project
                    </Link>
                    
                    {bid.status === 'pending' && (
                      <button
                        onClick={() => handleWithdrawClick(bid)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-red-700 bg-white hover:text-red-500 focus:outline-none focus:border-red-300 focus:shadow-outline-red active:text-red-800 active:bg-gray-50"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Withdraw
                      </button>
                    )}
                    
                    {bid.status === 'accepted' && (
                      <Link
                        to={`/messages?project=${bid.project?._id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-primary-700 bg-white hover:text-primary-500 focus:outline-none focus:border-primary-300 focus:shadow-outline-primary active:text-primary-800 active:bg-gray-50"
                      >
                        Message Client
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">You don't have any {activeTab !== 'all' ? activeTab : ''} bids yet.</p>
            <Link
              to="/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Projects
            </Link>
          </div>
        )}
      </div>
      
      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-30"></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6 shadow-xl">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                <XCircleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Withdraw Bid
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to withdraw your bid for this project? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={confirmWithdraw}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Withdraw
              </button>
              <button
                type="button"
                onClick={cancelWithdraw}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBidsPage;
