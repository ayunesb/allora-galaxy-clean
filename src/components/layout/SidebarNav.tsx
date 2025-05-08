
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/types/navigation';

interface SidebarNavProps {
  items: NavigationItem[];
  className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, className }) => {
  const location = useLocation();

  // Function to render icon component
  const renderIconComponent = (icon: React.ElementType | undefined) => {
    if (!icon) return null;
    const IconComponent = icon;
    return <IconComponent className="h-4 w-4" />;
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
            {item.icon && <span className="h-4 w-4">{renderIconComponent(item.icon)}</span>}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
