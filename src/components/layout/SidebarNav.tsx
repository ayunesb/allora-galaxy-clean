
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/types/navigation';

interface SidebarNavProps {
  items: NavigationItem[];
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ items, className }) => {
  const location = useLocation();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
