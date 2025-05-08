
import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from '@/components/layout/SidebarNav';
import { NavigationItem } from '@/types/navigation';
import { AdminGuard } from '@/components/guards/AdminGuard';

const AdminLayout: React.FC = () => {
  const navigationItems: NavigationItem[] = [
    {
      id: 'users',
      label: 'User Management',
      path: '/admin/users',
      icon: 'users'
    },
    {
      id: 'system-logs',
      label: 'System Logs',
      path: '/admin/system-logs',
      icon: 'list'
    },
    {
      id: 'plugin-logs',
      label: 'Plugin Logs',
      path: '/admin/plugin-logs',
      icon: 'clipboard-list'
    },
    {
      id: 'ai-decisions',
      label: 'AI Decisions',
      path: '/admin/ai-decisions',
      icon: 'brain'
    },
    {
      id: 'billing',
      label: 'Billing',
      path: '/admin/billing',
      icon: 'bar-chart'
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/admin/settings',
      icon: 'settings'
    },
  ];

  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <aside className="hidden w-64 flex-col border-r bg-background md:flex">
            <div className="flex flex-1 flex-col gap-4 p-4">
              <SidebarNav items={navigationItems} />
            </div>
          </aside>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminLayout;
