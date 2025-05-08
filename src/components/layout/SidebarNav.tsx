
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/types/navigation';
import * as LucideIcons from 'lucide-react';

interface SidebarNavProps {
  items: NavigationItem[];
  className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, className }) => {
  const location = useLocation();

  // Helper function to render icons from icon names
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as Record<string, React.ComponentType>)[
      iconName.charAt(0).toUpperCase() + iconName.slice(1)
    ];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

        return (
          <Link
            key={item.id}
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {item.icon && <span className="h-4 w-4">{renderIcon(item.icon)}</span>}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
