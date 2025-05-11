import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchProjects, getCategories } from '../../features/projects/projectsSlice';
import ProjectCard from '../../components/Projects/ProjectCard';
import Pagination from '../../components/common/Pagination';
import VoiceSearch from '../../components/VoiceSearch';

const SearchProjectsPage = () => {
  const dispatch = useDispatch();
  const { projects, pagination, categories, loading } = useSelector(state => state.projects);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [voiceSearchResults, setVoiceSearchResults] = useState(null);
  
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);
  
  useEffect(() => {
    handleSearch();
  }, [currentPage]);
  
  const handleSearch = () => {
    const params = {
      search: searchQuery,
      category: selectedCategory,
      skills: selectedSkills.join(','),
      budget_min: budgetMin,
      budget_max: budgetMax,
      page: currentPage,
      limit: 10
    };
    
    dispatch(searchProjects(params));
  };
  
  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
    setSelectedSkills(skills);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleVoiceSearchResults = (results) => {
    setVoiceSearchResults(results);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Projects</h1>
      
      <VoiceSearch onSearchResults={handleVoiceSearchResults} />
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search projects..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={selectedSkills.join(', ')}
              onChange={handleSkillsChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., React, Node.js, MongoDB"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Budget
            </label>
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Min budget"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Budget
            </label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Max budget"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Search
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {voiceSearchResults ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Voice Search Results</h2>
              {voiceSearchResults.data?.projects?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {voiceSearchResults.data.projects.map(project => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No projects found for your voice search.</p>
              )}
            </div>
          ) : (
            <>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No projects found matching your criteria.</p>
              )}
            </>
          )}
          
          {pagination && pagination.pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchProjectsPage;
