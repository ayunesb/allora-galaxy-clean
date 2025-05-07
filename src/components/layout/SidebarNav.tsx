
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/context/WorkspaceContext';
import NotificationCenter from '@/components/notifications/NotificationCenter';

type NavigationItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  role?: string;
};

interface SidebarNavProps {
  items: NavigationItem[];
  className?: string;
}

export function SidebarNav({ items, className }: SidebarNavProps) {
  const { pathname } = useLocation();
  const { currentRole } = useWorkspace();
  
  // Filter items based on user role
  const filteredItems = items.filter(item => {
    if (!item.role) return true;
    return currentRole === item.role || currentRole === 'admin';
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end px-4 py-2">
        <NotificationCenter />
      </div>
      <nav className={cn("flex flex-col gap-1 p-2", className)}>
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
