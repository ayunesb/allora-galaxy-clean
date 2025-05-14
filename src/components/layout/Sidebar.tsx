
import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { SidebarNav } from './SidebarNav';
import { NavigationItem } from '@/types/shared';
import { useSidebar } from '@/components/ui/sidebar/SidebarProvider';

interface SidebarProps {
  items?: NavigationItem[];
  navigationItems?: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ items, navigationItems: propNavigationItems }) => {
  const { collapsed } = useSidebar();
  // Use either provided items, propNavigationItems, or fall back to empty array
  const navItems = items || propNavigationItems || [];

  return (
    <div className={`bg-background border-r p-3 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}>
      <SidebarNav items={navItems} />
    </div>
  );
};

export default Sidebar;
