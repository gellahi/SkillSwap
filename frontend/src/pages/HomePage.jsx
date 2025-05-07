import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching featured projects and categories
    // In a real implementation, you would call your API
    setTimeout(() => {
      setFeaturedProjects([
        {
          id: '1',
          title: 'Modern E-commerce Website Development',
          description: 'Looking for an experienced developer to build a responsive e-commerce website with payment integration.',
          budget: 1500,
          deadline: '2 weeks',
          skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          clientName: 'TechSolutions Inc.'
        },
        {
          id: '2',
          title: 'Mobile App UI/UX Design',
          description: 'Need a creative designer to create intuitive and engaging user interfaces for a fitness tracking app.',
          budget: 800,
          deadline: '10 days',
          skills: ['UI/UX', 'Figma', 'Adobe XD', 'Mobile Design'],
          clientName: 'FitLife Apps'
        },
        {
          id: '3',
          title: 'Content Writing for Tech Blog',
          description: 'Seeking a skilled writer to create engaging content about the latest technology trends and innovations.',
          budget: 500,
          deadline: '1 week',
          skills: ['Content Writing', 'SEO', 'Tech Knowledge', 'Blogging'],
          clientName: 'TechInsider'
        }
      ]);
      
      setCategories([
        { id: '1', name: 'Web Development', count: 120, icon: 'code' },
        { id: '2', name: 'Mobile Development', count: 85, icon: 'mobile' },
        { id: '3', name: 'UI/UX Design', count: 74, icon: 'design' },
        { id: '4', name: 'Content Writing', count: 65, icon: 'edit' },
        { id: '5', name: 'Digital Marketing', count: 58, icon: 'chart' },
        { id: '6', name: 'Data Science', count: 42, icon: 'data' }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const features = [
    {
      title: 'Find Skilled Freelancers',
      description: 'Connect with talented professionals across various domains to bring your projects to life.',
      icon: <UserGroupIcon className="h-10 w-10 text-primary-600" />
    },
    {
      title: 'Post Projects',
      description: 'Easily post your project requirements and receive competitive bids from qualified freelancers.',
      icon: <BriefcaseIcon className="h-10 w-10 text-primary-600" />
    },
    {
      title: 'Secure Payments',
      description: 'Our escrow system ensures that payments are released only when you're satisfied with the work.',
      icon: <CurrencyDollarIcon className="h-10 w-10 text-primary-600" />
    },
    {
      title: 'Real-time Communication',
      description: 'Collaborate efficiently with built-in messaging and file sharing capabilities.',
      icon: <ChatBubbleLeftRightIcon className="h-10 w-10 text-primary-600" />
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl text-white py-12 px-6 md:py-20 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Connect, Collaborate, Create with SkillSwap
          </h1>
          <p className="text-lg md:text-xl mb-8 text-primary-100">
            The platform where talented freelancers meet clients with exciting projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                {user?.role === 'client' ? (
                  <Link
                    to="/create-project"
                    className="px-6 py-3 bg-white text-primary-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Post a Project
                  </Link>
                ) : (
                  <Link
                    to="/projects"
                    className="px-6 py-3 bg-white text-primary-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Find Projects
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-primary-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Join SkillSwap
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How SkillSwap Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform makes it easy to connect, collaborate, and create amazing projects together
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Projects</h2>
          <Link to="/projects" className="text-primary-600 hover:text-primary-700 font-medium">
            View All Projects
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between mt-6">
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map(project => (
              <div key={project.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                  {project.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{project.skills.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-4 text-sm">
                  <div className="font-medium text-primary-600">${project.budget}</div>
                  <div className="text-gray-500">{project.deadline}</div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-sm text-gray-500">{project.clientName}</div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-md animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/projects?category=${category.id}`}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center"
              >
                <div className="h-12 w-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-3">
                  {/* Placeholder for category icon */}
                  <span className="text-xl">{category.icon === 'code' ? '⌨️' : 
                                            category.icon === 'mobile' ? '📱' : 
                                            category.icon === 'design' ? '🎨' : 
                                            category.icon === 'edit' ? '✏️' : 
                                            category.icon === 'chart' ? '📊' : '📊'}</span>
                </div>
                <h3 className="text-gray-900 font-medium text-center">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} projects</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 rounded-xl py-12 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Ready to start your journey with SkillSwap?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of freelancers and clients already using our platform to collaborate on amazing projects
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign Up Now
          </Link>
          <Link
            to="/projects"
            className="px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse Projects
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
