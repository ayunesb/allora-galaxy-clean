
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/types/navigation';
import { 
  LayoutDashboard, 
  Grid3x3, 
  Rocket, 
  Bot, 
  Plug, 
  BarChart, 
  Settings, 
  Users, 
  Brain,
  List, 
  ClipboardList,
  LucideIcon
} from 'lucide-react';

interface SidebarNavProps {
  items: NavigationItem[];
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'grid-3x3': Grid3x3,
  'rocket': Rocket,
  'bot': Bot,
  'plug': Plug,
  'bar-chart': BarChart,
  'settings': Settings,
  'users': Users,
  'brain': Brain,
  'list': List,
  'clipboard-list': ClipboardList
};

const SidebarNav: React.FC<SidebarNavProps> = ({ items, className }) => {
  const location = useLocation();

  // Helper function to render icons from icon names
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName];
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
