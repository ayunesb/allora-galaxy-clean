
import React from 'react';
import { useWorkspace } from '@/contexts/workspace/WorkspaceContext';
import SidebarNav from './SidebarNav';
import { NavigationItem } from '@/types/shared';
import { navigationItems } from '@/contexts/workspace/navigationItems';

interface SidebarProps {
  items?: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ items = navigationItems }) => {
  const { collapsed } = useWorkspace();

  return (
    <div className={`bg-background border-r p-3 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}>
      <SidebarNav items={items} />
    </div>
  );
};

export default Sidebar;
