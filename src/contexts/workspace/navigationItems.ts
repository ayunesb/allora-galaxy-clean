
import { UserRole, NavigationItem } from '@/types/shared';
import {
  Home,
  Rocket,
  BarChart3,
  Settings,
  Users,
  LayoutDashboard,
  Activity,
  Globe,
  Database,
  Layers,
  Puzzle,
  FileText,
  Bell,
  Terminal
} from 'lucide-react';

/**
 * Get navigation items based on user role
 * 
 * @param userRole The user's role in the system
 * @returns Array of navigation items
 */
export function getNavigationItems(userRole: UserRole | string): NavigationItem[] {
  // Common navigation items for all authenticated users
  const commonItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: 'Galaxy',
      href: '/galaxy',
      icon: <Globe className="h-5 w-5" />
    },
    {
      title: 'Launch',
      href: '/launch',
      icon: <Rocket className="h-5 w-5" />
    },
    {
      title: 'Plugins',
      href: '/plugins',
      icon: <Puzzle className="h-5 w-5" />
    },
    {
      title: 'Insights',
      href: '/insights/kpis',
      icon: <BarChart3 className="h-5 w-5" />
    }
  ];
  
  // Admin-only navigation items
  const adminItems: NavigationItem[] = [
    {
      title: 'Admin',
      href: '/admin',
      icon: <Settings className="h-5 w-5" />,
      adminOnly: true
    },
    {
      title: 'System Logs',
      href: '/admin/logs',
      icon: <Layers className="h-5 w-5" />,
      adminOnly: true
    }
  ];
  
  // Determine which items to show based on role
  if (['owner', 'admin'].includes(userRole)) {
    return [...commonItems, ...adminItems];
  }
  
  return commonItems;
}
