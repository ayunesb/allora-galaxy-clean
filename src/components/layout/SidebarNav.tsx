
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/types/shared';
import * as LucideIcons from 'lucide-react';

interface SidebarNavProps {
  items: NavigationItem[];
  className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, className }) => {
  const location = useLocation();

  // Function to render icon component from string name
  const renderIcon = (icon?: string) => {
    if (!icon) return null;
    
    // Check if the icon name exists in Lucide icons
    const IconComponent = (LucideIcons as any)[icon];
    
    if (IconComponent) {
      return <IconComponent className="h-4 w-4" />;
    }
    
    return null;
  };

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
        const itemKey = item.href || item.name;

        return (
          <Link
            key={itemKey}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {item.icon && <span className="h-4 w-4">{renderIcon(item.icon)}</span>}
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
