
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import { useMediaQuery } from '@/hooks/use-media-query';
import { navigationItems } from '@/contexts/workspace/navigationItems';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

const MainLayout: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        
        <div className="flex flex-1">
          {!isMobile && <Sidebar items={navigationItems} />}
          
          <main className="flex-1 bg-background">
            <div className="container mx-auto py-6">
              <Outlet />
            </div>
          </main>
        </div>
        
        <Footer />
        
        {isMobile && <MobileNav />}
      </div>
    </WorkspaceProvider>
  );
};

export default MainLayout;
