
import { UserRole, NavigationItem } from '@/types/shared';
import {
  Rocket,
  BarChart3,
  Settings,
  LayoutDashboard,
  Globe,
  Puzzle
} from 'lucide-react';
import React from 'react';

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
      icon: React.createElement(LayoutDashboard, { className: "h-5 w-5" })
    },
    {
      title: 'Galaxy',
      href: '/galaxy',
      icon: React.createElement(Globe, { className: "h-5 w-5" })
    },
    {
      title: 'Launch',
      href: '/launch',
      icon: React.createElement(Rocket, { className: "h-5 w-5" })
    },
    {
      title: 'Plugins',
      href: '/plugins',
      icon: React.createElement(Puzzle, { className: "h-5 w-5" })
    },
    {
      title: 'Insights',
      href: '/insights/kpis',
      icon: React.createElement(BarChart3, { className: "h-5 w-5" })
    }
  ];
  
  // Admin-only navigation items
  const adminItems: NavigationItem[] = [
    {
      title: 'Admin',
      href: '/admin',
      icon: React.createElement(Settings, { className: "h-5 w-5" }),
      adminOnly: true
    },
    {
      title: 'System Logs',
      href: '/admin/logs',
      icon: React.createElement(Settings, { className: "h-5 w-5" }),
      adminOnly: true
    }
  ];
  
  // Determine which items to show based on role
  if (['owner', 'admin'].includes(userRole)) {
    return [...commonItems, ...adminItems];
  }
  
  return commonItems;
}
