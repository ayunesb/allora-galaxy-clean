
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  external?: boolean;
  submenu?: NavigationItem[];
  requiresAuth?: boolean;
  requiredRoles?: string[];
}

interface SidebarNavProps {
  items: NavigationItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const location = useLocation();
  const { collapsed } = useSidebar();

  // Filter and sort navigation items
  const navigationItems = useMemo(() => {
    return items;
  }, [items]);

  return (
    <div className={cn(
      "flex h-screen fixed left-0 top-0 border-r bg-background flex-col w-[250px] transition-all duration-300 z-50",
      collapsed ? "w-[60px]" : "w-[250px]"
    )}>
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b">
        <NavLink to="/" className="flex items-center gap-2">
          {!collapsed ? (
            <span className="font-semibold text-xl">Allora OS</span>
          ) : (
            <span className="font-bold text-xl">A</span>
          )}
        </NavLink>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {navigationItems.map((item, index) => (
            <NavItem 
              key={index} 
              item={item} 
              currentPath={location.pathname} 
              collapsed={collapsed} 
            />
          ))}
        </nav>
      </div>
      
      {/* User profile and logout */}
      <div className="border-t p-4">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                U
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">User</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              U
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface NavItemProps {
  item: NavigationItem;
  currentPath: string;
  collapsed: boolean;
}

function NavItem({ item, currentPath, collapsed }: NavItemProps) {
  const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
  
  if (item.disabled) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start opacity-50",
          collapsed ? "justify-center px-2" : "px-3"
        )}
        disabled={true}
      >
        {item.icon && <span className={cn(collapsed ? "mr-0" : "mr-2")}>{item.icon}</span>}
        {!collapsed && <span>{item.title}</span>}
      </Button>
    );
  }
  
  return (
    <NavLink
      to={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className={({ isActive }) => 
        cn(
          "flex items-center text-sm px-3 py-2 rounded-md",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
          collapsed ? "justify-center" : "justify-start"
        )
      }
    >
      {item.icon && <span className={cn(collapsed ? "mr-0" : "mr-2")}>{item.icon}</span>}
      {!collapsed && <span>{item.title}</span>}
    </NavLink>
  );
}
