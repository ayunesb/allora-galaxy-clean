
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/navigation/Sidebar';
import Navbar from '@/components/navigation/Navbar';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for navigation */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation bar */}
        <Navbar>
          <div className="flex items-center gap-4">
            <WorkspaceSwitcher />
            <ThemeToggle />
          </div>
        </Navbar>
        
        {/* Main content with scrolling */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
