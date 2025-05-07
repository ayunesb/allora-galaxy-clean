
import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { Outlet } from 'react-router-dom';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import MobileSidebarToggle from '@/components/layout/MobileSidebarToggle';

const MainLayout = () => {
  const { navigationItems } = useWorkspace();
  
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 lg:gap-6">
        <div className="hidden md:block md:w-[240px]">
          <h1 className="text-lg font-semibold">Allora OS</h1>
        </div>
        <div className="md:hidden">
          <MobileSidebarToggle onClick={() => {}} />
        </div>
        <div className="flex-1">
          {/* Header content */}
        </div>
        <NotificationCenter />
      </div>
      <div className="flex">
        <SidebarNav items={navigationItems} />
        <main className="flex-1 p-4 pt-6 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
