
import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  isActive?: boolean;
}

interface SidebarNavProps {
  items: NavigationItem[];
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ items, className }) => {
  const sidebar = useSidebar();
  
  return (
    <aside className={cn(
      "fixed left-0 top-0 z-30 h-screen w-64 border-r border-border bg-card text-card-foreground transition-all",
      sidebar.isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16",
      className
    )}>
      <nav className="flex flex-col gap-2 p-4">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
              item.isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            {item.icon && <span>{item.icon}</span>}
            <span className={cn("transition-opacity", sidebar.isOpen ? "opacity-100" : "opacity-0 md:hidden")}>
              {item.title}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
};
