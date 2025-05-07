import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjectById } from '../../features/projects/projectsSlice';
import { getProjectBids, createBid } from '../../features/bids/bidsSlice';
import { joinProject, leaveProject } from '../../services/socketService';
import { format } from 'date-fns';
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  CalendarIcon, 
  MapPinIcon,
  TagIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { project, loading: projectLoading } = useSelector(state => state.projects);
  const { bids, loading: bidsLoading } = useSelector(state => state.bids);
  
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDeliveryTime, setBidDeliveryTime] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  
  // Fetch project and bids on component mount
  useEffect(() => {
    if (id) {
      dispatch(getProjectById(id));
      dispatch(getProjectBids({ projectId: id }));
      
      // Join the project room for real-time updates
      joinProject(id);
      
      // Clean up when leaving the project
      return () => {
        leaveProject(id);
      };
    }
  }, [dispatch, id]);
  
  // Handle bid submission
  const handleSubmitBid = (e) => {
    e.preventDefault();
    
    if (!bidAmount || !bidDeliveryTime || !bidProposal) return;
    
    dispatch(createBid({
      projectId: id,
      amount: parseFloat(bidAmount),
      deliveryTime: parseInt(bidDeliveryTime),
      proposal: bidProposal
    }));
    
    // Reset form
    setBidAmount('');
    setBidDeliveryTime('');
    setBidProposal('');
    setShowBidForm(false);
  };
  
  // Check if user has already bid on this project
  const hasUserBid = () => {
    return bids?.some(bid => bid.freelancerId === user?._id);
  };
  
  // Render loading state
  if (projectLoading && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Render 404 state
  if (!project && !projectLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-8">The project you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/projects"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Browse Projects
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project?.title}</h1>
            <p className="text-gray-600 mt-1">Posted {format(new Date(project?.createdAt), 'MMM d, yyyy')}</p>
          </div>
          
          {user?.role === 'freelancer' && !hasUserBid() && (
            <button
              onClick={() => setShowBidForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Place Bid
            </button>
          )}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-medium">${project?.budget}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{project?.duration} {project?.durationType}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="font-medium">{format(new Date(project?.deadline), 'MMM d, yyyy')}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{project?.location}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700">{project?.description}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700">{project?.requirements}</p>
            </div>
          </div>
          
          {/* Skills */}
          {project?.skills && project.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    <TagIcon className="h-4 w-4 mr-1" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          {/* Client Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Client</h2>
            <div className="flex items-center mb-4">
              <img
                className="h-12 w-12 rounded-full mr-4"
                src={project?.client?.profilePicture || `https://ui-avatars.com/api/?name=${project?.client?.firstName}+${project?.client?.lastName}`}
                alt={project?.client?.firstName}
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{project?.client?.firstName} {project?.client?.lastName}</h3>
                <p className="text-gray-600">{project?.client?.location?.country}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <UserIcon className="h-5 w-5 mr-2" />
              <p>Member since {project?.client?.createdAt ? format(new Date(project.client.createdAt), 'MMM yyyy') : 'N/A'}</p>
            </div>
            <div className="flex items-center text-gray-600">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              <p>{project?.client?.projectCount || 0} projects posted</p>
            </div>
          </div>
          
          {/* Bids */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Bids</h2>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
                {project?.bidCount || 0} bids
              </span>
            </div>
            
            {bidsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : bids?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No bids yet</p>
            ) : (
              <div className="space-y-4">
                {bids?.map(bid => (
                  <div key={bid._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full mr-2"
                          src={bid.freelancer?.profilePicture || `https://ui-avatars.com/api/?name=${bid.freelancer?.firstName}+${bid.freelancer?.lastName}`}
                          alt={bid.freelancer?.firstName}
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{bid.freelancer?.firstName} {bid.freelancer?.lastName}</h3>
                          <p className="text-xs text-gray-500">{bid.freelancer?.title || 'Freelancer'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${bid.amount}</p>
                        <p className="text-xs text-gray-500">in {bid.deliveryTime} days</p>
                      </div>
                    </div>
                    {bid.proposal && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700 line-clamp-3">{bid.proposal}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bid Form Modal */}
      {showBidForm && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Place a Bid
                    </h3>
                    
                    <form onSubmit={handleSubmitBid}>
                      <div className="mb-4">
                        <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                          Bid Amount ($)
                        </label>
                        <input
                          type="number"
                          id="bidAmount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min="1"
                          step="0.01"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="bidDeliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Time (days)
                        </label>
                        <input
                          type="number"
                          id="bidDeliveryTime"
                          value={bidDeliveryTime}
                          onChange={(e) => setBidDeliveryTime(e.target.value)}
                          min="1"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="bidProposal" className="block text-sm font-medium text-gray-700 mb-1">
                          Proposal
                        </label>
                        <textarea
                          id="bidProposal"
                          value={bidProposal}
                          onChange={(e) => setBidProposal(e.target.value)}
                          rows="4"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Explain why you're the best fit for this project..."
                        ></textarea>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmitBid}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Submit Bid
                </button>
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
