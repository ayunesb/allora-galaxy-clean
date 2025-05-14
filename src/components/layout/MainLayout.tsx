
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import MobileSidebar from './MobileSidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { navigationItems } from '@/components/layout/sidebar/NavItems';
import { WorkspaceProvider } from '@/context/WorkspaceContext';

const MainLayout: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar>
          {isMobile ? <MobileSidebar /> : null}
        </Navbar>
        
        <div className="flex flex-1">
          {!isMobile && <Sidebar className="z-20" />}
          
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
