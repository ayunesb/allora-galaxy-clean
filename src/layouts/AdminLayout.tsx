
import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { Outlet } from 'react-router-dom';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Settings, Users, BoxIcon, FileText, Database } from 'lucide-react';

const AdminLayout = () => {
  const { navigationItems } = useWorkspace();
  
  // Define admin-specific navigation items
  const adminItems = [
    {
      title: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'System Logs',
      href: '/admin/system-logs',
      icon: FileText,
    },
    {
      title: 'Plugin Logs',
      href: '/admin/plugin-logs',
      icon: BoxIcon,
    },
    {
      title: 'AI Decisions',
      href: '/admin/ai-decisions',
      icon: Database,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];
  
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 lg:gap-6">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <NotificationCenter />
      </div>
      <div className="flex">
        <SidebarNav items={adminItems} />
        <main className="flex-1 p-4 pt-6 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
