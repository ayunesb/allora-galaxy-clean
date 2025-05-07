
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/layout/SidebarNav';
import Footer from '@/components/layout/Footer';

export interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <div className="flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-6 py-3">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </div>
        <main className="flex-1 py-6 px-6 md:px-8">
          {children || <Outlet />}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
