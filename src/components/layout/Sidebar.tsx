
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/contexts/workspace/WorkspaceContext';
import { NavigationItem } from '@/types/shared';

interface SidebarProps {
  navigationItems: NavigationItem[];
  collapsible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems, collapsible = false }) => {
  const location = useLocation();
  const { collapsed, toggleCollapsed } = useWorkspace();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const renderNavigationItems = (items: NavigationItem[]) => {
    return items.map((item) => (
      <div key={item.href}>
        <Link
          to={item.href}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
            isActive(item.href)
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          {(!collapsed || !collapsible) && <span>{item.name}</span>}
        </Link>

        {item.children && item.children.length > 0 && (
          <div className={cn('ml-4 mt-2 space-y-1', collapsed && collapsible ? 'hidden' : '')}>
            {item.children.map((child: NavigationItem) => (
              <Link
                key={child.href}
                to={child.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive(child.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {child.icon && <child.icon className="h-4 w-4" />}
                <span>{child.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-y-auto bg-background border-r',
        collapsed && collapsible ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col gap-4 p-4">
        {collapsible && (
          <button
            onClick={toggleCollapsed}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-transparent hover:bg-accent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn('transition-transform', collapsed ? 'rotate-180' : '')}
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        <nav className="flex flex-col gap-1">
          {renderNavigationItems(navigationItems)}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
