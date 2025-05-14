
import React from 'react';
import { cn } from '@/lib/utils';
import SidebarNav from './SidebarNav';
import { navigationItems } from './sidebar/NavItems';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <div className={cn(
      "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-sidebar",
      className
    )}>
      <div className="flex-1 flex flex-col min-h-0">
        <SidebarNav items={navigationItems} />
      </div>
    </div>
  );
};

export default Sidebar;
