
import { LayoutDashboard, Settings, User, Users, LineChart, Folder, Cog, Bell } from 'lucide-react';
import { NavigationItem } from '@/types/shared';

// Define navigation items for each user role
export const getNavigationItems = (role?: string): NavigationItem[] => {
  // Base navigation available to all roles
  const baseNavigation: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'strategies',
      title: 'Strategies',
      href: '/strategies',
      icon: Folder,
    },
    {
      id: 'evolution',
      title: 'Evolution',
      href: '/evolution',
      icon: LineChart,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      href: '/notifications',
      icon: Bell,
    }
  ];

  // Navigation items only available to admins and owners
  const adminNavigation: NavigationItem[] = [
    {
      id: 'admin',
      title: 'Admin',
      href: '/admin',
      icon: Cog,
      items: [
        {
          id: 'admin-dashboard',
          title: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
        },
        {
          id: 'user-management',
          title: 'User Management',
          href: '/admin/users',
          icon: Users,
        },
        {
          id: 'api-keys',
          title: 'API Keys',
          href: '/admin/api-keys',
          icon: Cog,
        },
        {
          id: 'system-logs',
          title: 'System Logs',
          href: '/admin/logs',
          icon: Folder,
        }
      ],
    },
  ];

  // Settings navigation available to all users
  const settingsNavigation: NavigationItem[] = [
    {
      id: 'settings',
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      items: [
        {
          id: 'profile',
          title: 'Profile',
          href: '/settings/profile',
          icon: User,
        }
      ],
    },
  ];

  // Combine navigation based on role
  if (role === 'owner' || role === 'admin') {
    return [...baseNavigation, ...adminNavigation, ...settingsNavigation];
  }

  return [...baseNavigation, ...settingsNavigation];
};

export default getNavigationItems;
