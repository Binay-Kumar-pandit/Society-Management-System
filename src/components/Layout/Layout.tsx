import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user && !loading) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      <main
        className={`
          flex-1 transition-all duration-300 p-4 lg:p-6
          ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          overflow-auto relative z-30
          min-h-screen
        `}
      >
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;