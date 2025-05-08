
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { NavigationItem } from '@/types/shared';
import SidebarProfile from './sidebar/SidebarProfile';
import SidebarFooterActions from './sidebar/SidebarFooterActions';

interface SidebarProps {
  items: NavigationItem[];
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ items, className }) => {
  const location = useLocation();
  const { userRole } = useWorkspace();
  
  // Filter items based on user role
  const filteredItems = items.filter(item => {
    if (!item.requiresRole) return true;
    return userRole && item.requiresRole.includes(userRole);
  });
  
  return (
    <div className={cn(
      'w-64 h-screen border-r shrink-0 overflow-y-auto sticky top-0 bg-background',
      className
    )}>
      <div className="flex flex-col h-full">
        <div className="flex-1 py-2">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Navigation
            </h2>
            <div className="space-y-1">
              {filteredItems.map((item, i) => {
                const isActive = item.isActive 
                  ? item.isActive(location.pathname)
                  : location.pathname.startsWith(item.href);
                  
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={i}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {IconComponent && (
                      <IconComponent className="h-4 w-4" />
                    )}
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-auto">
          <SidebarProfile />
          <SidebarFooterActions />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
