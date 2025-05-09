
import React from 'react';
import { useWorkspace } from '@/contexts/workspace/WorkspaceContext';
import SidebarNav from './SidebarNav';
import { NavigationItem } from '@/types/shared';

interface SidebarProps {
  navigationItems: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems }) => {
  const { collapsed } = useWorkspace();

  return (
    <div className={`bg-background border-r p-3 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}>
      <SidebarNav items={navigationItems} collapsed={collapsed} />
    </div>
  );
};

export default Sidebar;
