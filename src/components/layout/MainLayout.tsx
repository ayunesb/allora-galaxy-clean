
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { getNavigationItems } from '@/contexts/workspace/navigationItems';
import { NavigationItem } from '@/types/shared';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { userRole, tenant } = useWorkspace();
  
  // Get navigation items based on user role
  const navigationItems: NavigationItem[] = getNavigationItems(userRole || 'guest');
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar navigationItems={navigationItems} />
        
        <main className="flex-1 p-6 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
