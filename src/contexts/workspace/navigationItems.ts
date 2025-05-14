
import type { NavigationItem } from '@/types/navigation';
import { LayoutDashboard, Boxes, Settings, Users, FileCode2, Activity, AreaChart, FileSpreadsheet, Key, Clock } from 'lucide-react';

// Default navigation items when no workspace is selected
export const defaultWorkspaceNavigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Plugins',
    href: '/plugins',
    icon: Boxes,
  }
];

// Navigation items based on user role
export const getWorkspaceNavigation = (role: string): NavigationItem[] => {
  // Base navigation items for all roles
  const baseNavigation: NavigationItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Plugins',
      href: '/plugins',
      icon: Boxes,
    },
    {
      title: 'Strategies',
      href: '/strategies',
      icon: FileCode2,
    },
    {
      title: 'Evolution',
      href: '/evolution',
      icon: Activity,
    },
    {
      title: 'KPI',
      href: '/insights',
      icon: AreaChart,
    }
  ];

  // Admin and owner get additional navigation items
  if (role === 'admin' || role === 'owner') {
    return [
      ...baseNavigation,
      {
        title: 'Admin',
        icon: Settings,
        children: [
          {
            title: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
          },
          {
            title: 'Users',
            href: '/admin/users',
            icon: Users,
          },
          {
            title: 'System Logs',
            href: '/admin/logs',
            icon: FileSpreadsheet,
          },
          {
            title: 'API Keys',
            href: '/admin/api-keys',
            icon: Key,
          },
          {
            title: 'CRON Jobs',
            href: '/admin/cron',
            icon: Clock,
          }
        ]
      }
    ];
  }

  return baseNavigation;
};
