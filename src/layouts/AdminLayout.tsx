
import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from '@/components/layout/SidebarNav';
import { Users, Settings, AlertCircle, Database, Layers, BarChart } from 'lucide-react';
import { NavigationItem } from '@/types/navigation';
import { AdminGuard } from '@/components/guards/AdminGuard';

const AdminLayout: React.FC = () => {
  const navigationItems: NavigationItem[] = [
    {
      title: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'System Logs',
      href: '/admin/system-logs',
      icon: AlertCircle,
    },
    {
      title: 'Plugin Logs',
      href: '/admin/plugin-logs',
      icon: Database,
    },
    {
      title: 'AI Decisions',
      href: '/admin/ai-decisions',
      icon: Layers,
    },
    {
      title: 'Billing',
      href: '/admin/billing',
      icon: BarChart,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
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
