
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/types/shared';
import { navigationItems } from '@/contexts/workspace/navigationItems';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTenantRole } from '@/hooks/useTenantRole';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { role: userRole } = useTenantRole();
  
  const toggleSubmenu = (href: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };
  
  const isLinkActive = (href: string) => {
    if (href === '/') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const userHasRequiredRole = (item: NavigationItem) => {
    if (!item.requiresRole) return true;
    if (!userRole) return false;
    return item.requiresRole.includes(userRole);
  };

  const renderNavItem = (item: NavigationItem) => {
    const active = isLinkActive(item.href);
    
    // Check if user has the required role to see this item
    if (!userHasRequiredRole(item)) return null;
    
    if (item.children) {
      const isOpen = openItems[item.href] || active;
      const hasActiveChild = item.children.some((child) => isLinkActive(child.href));
      
      return (
        <React.Fragment key={item.href}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between px-2 h-9 font-medium",
              (active || hasActiveChild) ? "bg-accent text-accent-foreground" : "transparent"
            )}
            onClick={() => toggleSubmenu(item.href)}
          >
            <span className="flex items-center">
              {item.icon && <item.icon className="h-4 w-4 mr-2" />}
              {item.name}
            </span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {isOpen && (
            <div className="ml-4 border-l pl-2 border-muted">
              {item.children.map(renderNavItem)}
            </div>
          )}
        </React.Fragment>
      );
    }
    
    return (
      <div key={item.href}>
        {item.divider && <div className="h-px bg-border my-2" />}
        <Link
          to={item.href}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
            active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          {item.name}
        </Link>
      </div>
    );
  };

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="space-y-1 py-2">
        {navigationItems.map(renderNavItem)}
      </div>
    </ScrollArea>
  );
};

export default Sidebar;
