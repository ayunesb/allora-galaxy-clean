
import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from '@/components/layout/SidebarNav';
import { Users, Settings, BarChart, AlertTriangle, Database, Layers } from 'lucide-react';
import { NavigationItem } from '@/types/navigation';

const AdminLayout: React.FC = () => {
  const navigationItems: NavigationItem[] = [
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'System Logs',
      href: '/admin/logs',
      icon: AlertTriangle,
    },
    {
      title: 'Plugin Logs',
      href: '/admin/plugins',
      icon: Database,
    },
    {
      title: 'AI Decision History',
      href: '/admin/decisions',
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
  );
};

export default AdminLayout;
