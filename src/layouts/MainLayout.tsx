
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/navigation/Sidebar';
import Footer from '@/components/layout/Footer';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
