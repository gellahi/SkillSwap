import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Sidebar from '../common/Sidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <div className="flex flex-1">
        {isAuthenticated && (
          <Sidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
        )}
        
        <main className={`flex-1 px-4 py-8 md:px-8 ${isAuthenticated ? 'lg:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
