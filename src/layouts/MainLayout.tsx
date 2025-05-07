
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/layout/SidebarNav';
import Footer from '@/components/layout/Footer';

export interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <div className="flex flex-col flex-1">
        <main className="flex-1 py-6 px-6 md:px-8">
          {children || <Outlet />}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
