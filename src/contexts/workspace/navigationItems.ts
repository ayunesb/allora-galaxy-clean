
import { 
  Home, 
  Layout, 
  Settings, 
  Users, 
  Package, 
  Activity, 
  Rocket,
  Database,
  GitBranchPlus,
  BarChart3,
  FileText,
  Bell,
  Terminal
} from 'lucide-react';
import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/types/shared';

/**
 * Get navigation items based on user role
 * @param role User role
 * @returns Array of navigation items
 */
export function getNavigationItems(role: UserRole): NavigationItem[] {
  // Common items that all users can see
  const commonItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: Home
    },
    {
      id: 'galaxy',
      label: 'Galaxy',
      path: '/galaxy',
      icon: GitBranchPlus
    },
    {
      id: 'plugins',
      label: 'Plugins',
      path: '/plugins',
      icon: Package
    },
    {
      id: 'launch',
      label: 'Launch',
      path: '/launch',
      icon: Rocket
    },
    {
      id: 'insights',
      label: 'Insights',
      path: '/insights',
      icon: BarChart3,
      items: [
        {
          id: 'kpis',
          label: 'KPIs',
          path: '/insights/kpis'
        },
        {
          id: 'reports',
          label: 'Reports',
          path: '/insights/reports'
        }
      ]
    },
  ];

  // Admin-only items
  const adminItems: NavigationItem[] = [
    {
      id: 'admin',
      label: 'Admin',
      path: '/admin',
      icon: Layout,
      adminOnly: true,
      items: [
        {
          id: 'users',
          label: 'Users',
          path: '/admin/users'
        },
        {
          id: 'logs',
          label: 'System Logs',
          path: '/admin/logs'
        },
        {
          id: 'settings',
          label: 'Settings',
          path: '/admin/settings'
        }
      ]
    }
  ];

  // Return different items based on role
  if (role === 'admin' || role === 'owner') {
    return [...commonItems, ...adminItems];
  }
  
  return commonItems;
}
