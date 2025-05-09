
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NavigationItem } from '@/types/shared';
import { useTenantRole } from '@/hooks/useTenantRole';

interface SidebarProps {
  items: NavigationItem[];
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ items, collapsed }) => {
  const location = useLocation();
  const { userRole } = useTenantRole();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isItemVisible = (item: NavigationItem) => {
    // Show item if no role requirements or if user has required role
    if (!item.requiresRole) return true;
    
    if (!userRole) return false;
    
    return item.requiresRole.includes(userRole);
  };

  const renderNavItem = (item: NavigationItem) => {
    if (!isItemVisible(item)) return null;

    const ItemIcon = item.icon;
    
    return (
      <li key={item.href}>
        <NavLink
          to={item.href}
          className={({ isActive }) =>
            `flex items-center py-2 px-3 my-1 font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground'
            }`
          }
        >
          {ItemIcon && <ItemIcon className="h-5 w-5 mr-2" />}
          {!collapsed && <span>{item.name}</span>}
        </NavLink>

        {item.children && item.children.length > 0 && !collapsed && (
          <ul className="ml-4 mt-1">
            {item.children.filter(isItemVisible).map((child) => (
              <li key={child.href}>
                <NavLink
                  to={child.href}
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent/50 text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/30 text-sidebar-foreground/70 hover:text-sidebar-foreground'
                    }`
                  }
                >
                  {child.name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div
      className={`h-screen bg-sidebar fixed top-0 left-0 w-64 z-40 border-r border-sidebar-border transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-sidebar-border flex items-center justify-center">
          {collapsed ? (
            <span className="text-2xl font-bold">A</span>
          ) : (
            <span className="text-2xl font-bold">Allora OS</span>
          )}
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {items.map(renderNavItem)}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {/* Footer items can go here */}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
