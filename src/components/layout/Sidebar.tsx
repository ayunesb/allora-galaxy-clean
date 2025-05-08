
import React from 'react';
import { NavigationItem } from '@/types/shared';
import { useLocation, Link } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  items: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const location = useLocation();
  const { userRole } = useWorkspace();

  // Filter navigation items based on user role
  const filteredItems = items.filter(item => {
    // If the item requires specific roles and user role is not in the list, hide it
    if (item.requiresRole && userRole && !item.requiresRole.includes(userRole)) {
      return false;
    }
    return true;
  });

  // Check if a nav item is active
  const isActive = (item: NavigationItem) => {
    if (item.isActive) {
      return item.isActive(location.pathname);
    }
    
    // Default behavior: check if the path starts with the href
    // But for root path (/), only consider it active if the pathname is exactly "/"
    if (item.href === '/') {
      return location.pathname === '/';
    }
    
    return location.pathname.startsWith(item.href);
  };

  return (
    <div className="w-64 h-full bg-card border-r border-border flex-shrink-0">
      <div className="p-4 h-full flex flex-col">
        <nav className="space-y-1 flex-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {Icon && <Icon className="mr-3 h-5 w-5" />}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
