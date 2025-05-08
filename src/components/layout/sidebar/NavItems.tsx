
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Rocket,
  Settings,
  Network,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar/SidebarProvider';

export interface NavItemsProps {
  className?: string;
}

export function NavItems({ className }: NavItemsProps) {
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();
  
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Strategies',
      path: '/strategies',
      icon: Target,
    },
    {
      label: 'Insights',
      path: '/insights',
      icon: BarChart3,
    },
    {
      label: 'Galaxy',
      path: '/galaxy',
      icon: Network,
    },
    {
      label: 'Launch',
      path: '/launch',
      icon: Rocket,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {menuItems.map((item, index) => {
        const isActive = location.pathname.startsWith(item.path);
        
        return (
          <Link
            key={index}
            to={item.path}
            className={cn(
              "flex items-center h-10 rounded-md px-3 py-2 text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
      
      {/* Toggle sidebar collapse state */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "mt-auto mb-4",
          collapsed ? "mx-auto" : "ml-auto mr-4"
        )}
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>
    </div>
  );
}
