
import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from '@/components/layout/SidebarNav';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { NavigationItem } from '@/types/navigation';

const MainLayout: React.FC = () => {
  const { navigationItems = [] } = useWorkspace();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <div className="flex flex-1 flex-col gap-4 p-4">
            <SidebarNav items={navigationItems as NavigationItem[]} />
          </div>
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
