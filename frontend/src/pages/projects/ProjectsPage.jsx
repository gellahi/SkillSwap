import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { getProjects } from '../../features/projects/projectsSlice';
import { 
  AdjustmentsHorizontalIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { projects, loading, pagination } = useSelector(state => state.projects);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    skills: searchParams.get('skills') ? searchParams.get('skills').split(',') : [],
    sort: searchParams.get('sort') || 'newest'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  
  // Fetch projects on component mount and when filters change
  useEffect(() => {
    // Simulate fetching categories and skills
    setCategories([
      { id: '1', name: 'Web Development' },
      { id: '2', name: 'Mobile Development' },
      { id: '3', name: 'UI/UX Design' },
      { id: '4', name: 'Content Writing' },
      { id: '5', name: 'Digital Marketing' },
      { id: '6', name: 'Data Science' }
    ]);
    
    setPopularSkills([
      'React', 'Node.js', 'JavaScript', 'Python', 'UI/UX', 'WordPress',
      'Mobile App', 'SEO', 'Content Writing', 'Data Analysis'
    ]);
    
    // Build query params from filters
    const queryParams = {};
    if (filters.search) queryParams.search = filters.search;
    if (filters.category) queryParams.category = filters.category;
    if (filters.minBudget) queryParams.minBudget = filters.minBudget;
    if (filters.maxBudget) queryParams.maxBudget = filters.maxBudget;
    if (filters.skills.length > 0) queryParams.skills = filters.skills.join(',');
    if (filters.sort) queryParams.sort = filters.sort;
    
    // Update URL with filters
    setSearchParams(queryParams);
    
    // Fetch projects with filters
    dispatch(getProjects(queryParams));
  }, [dispatch, filters, setSearchParams]);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    setFilters(prev => ({ ...prev, search: searchInput }));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSkillToggle = (skill) => {
    setFilters(prev => {
      const updatedSkills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: updatedSkills };
    });
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minBudget: '',
      maxBudget: '',
      skills: [],
      sort: 'newest'
    });
  };
  
  const hasActiveFilters = () => {
    return filters.category || filters.minBudget || filters.maxBudget || filters.skills.length > 0;
  };
  
  // Placeholder projects for UI development
  const placeholderProjects = [
    {
      _id: '1',
      title: 'Modern E-commerce Website Development',
      description: 'Looking for an experienced developer to build a responsive e-commerce website with payment integration.',
      budget: 1500,
      deadline: '2023-06-30',
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      client: {
        _id: 'c1',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      createdAt: '2023-05-15T10:30:00Z',
      bidCount: 8
    },
    {
      _id: '2',
      title: 'Mobile App UI/UX Design',
      description: 'Need a creative designer to create intuitive and engaging user interfaces for a fitness tracking app.',
      budget: 800,
      deadline: '2023-06-15',
      skills: ['UI/UX', 'Figma', 'Adobe XD', 'Mobile Design'],
      client: {
        _id: 'c2',
        firstName: 'Jane',
        lastName: 'Smith',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      createdAt: '2023-05-18T14:45:00Z',
      bidCount: 5
    },
    {
      _id: '3',
      title: 'Content Writing for Tech Blog',
      description: 'Seeking a skilled writer to create engaging content about the latest technology trends and innovations.',
      budget: 500,
      deadline: '2023-06-10',
      skills: ['Content Writing', 'SEO', 'Tech Knowledge', 'Blogging'],
      client: {
        _id: 'c3',
        firstName: 'Robert',
        lastName: 'Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      createdAt: '2023-05-20T09:15:00Z',
      bidCount: 12
    }
  ];
  
  // Use placeholder projects if real data is not available
  const displayProjects = projects?.length > 0 ? projects : placeholderProjects;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Browse Projects</h1>
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
          <input
            type="text"
            name="search"
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <button type="submit" className="sr-only">Search</button>
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
          Filters
          {hasActiveFilters() && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
              {filters.skills.length + (filters.category ? 1 : 0) + (filters.minBudget || filters.maxBudget ? 1 : 0)}
            </span>
          )}
        </button>
      </div>
      
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Filter Projects</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minBudget"
                  placeholder="Min"
                  value={filters.minBudget}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  name="maxBudget"
                  placeholder="Max"
                  value={filters.maxBudget}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget_high">Highest Budget</option>
                <option value="budget_low">Lowest Budget</option>
                <option value="deadline_soon">Deadline (Soonest)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filters.skills.includes(skill)
                      ? 'bg-primary-100 text-primary-800 border border-primary-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-6 w-16 bg-gray-200 rounded-full"></div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayProjects.map(project => (
              <div key={project._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link to={`/projects/${project._id}`} className="hover:text-primary-600">
                      {project.title}
                    </Link>
                  </h2>
                  <span className="text-lg font-medium text-primary-600">${project.budget}</span>
                </div>
                
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={project.client?.avatar || 'https://via.placeholder.com/40'}
                        alt={`${project.client?.firstName} ${project.client?.lastName}`}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {project.client?.firstName} {project.client?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Posted {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 sm:mt-0">
                    <span className="text-sm text-gray-500 mr-4">
                      {project.bidCount} bids
                    </span>
                    <Link
                      to={`/projects/${project._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Project
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => dispatch(getProjects({ ...filters, page: pagination.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                {/* Page numbers would go here */}
                <button
                  onClick={() => dispatch(getProjects({ ...filters, page: pagination.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage === pagination.totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsPage;
