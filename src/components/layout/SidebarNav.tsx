
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/types/shared';
import { Badge } from '@/components/ui/badge';
import { useTenantRole } from '@/hooks/useTenantRole';

interface SidebarNavProps {
  items: NavigationItem[];
}

export default function SidebarNav({ items }: SidebarNavProps) {
  const { pathname } = useLocation();
  const { role } = useTenantRole();
  
  const isAdmin = role === 'admin' || role === 'owner';

  const filteredItems = React.useMemo(() => {
    return items.filter(item => !item.adminOnly || isAdmin);
  }, [items, isAdmin]);
  
  return (
    <nav className="space-y-1 px-2 py-3">
      {filteredItems.map((item) => {
        // Check if this item or any child is active
        const isActive = pathname === item.href || 
                        (item.items?.some(child => pathname === child.href));
        
        if (item.items?.length) {
          return (
            <div key={item.id || item.href} className="space-y-1">
              <div className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}>
                {item.icon && <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />}
                <span>{item.title}</span>
              </div>
              
              <div className="space-y-1 pl-10">
                {item.items.map((child) => (
                  <Link
                    key={child.id || child.href}
                    to={child.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                      pathname === child.href
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <span>{child.title}</span>
                    {child.badge && (
                      <Badge 
                        variant="secondary"
                        className="ml-auto py-0.5"
                      >
                        {child.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        }
        
        return (
          <Link
            key={item.id || item.href}
            to={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
              pathname === item.href
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
          >
            {item.icon && <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />}
            <span>{item.title}</span>
            {item.badge && (
              <Badge 
                variant="secondary"
                className="ml-auto py-0.5"
              >
                {item.badge}
              </Badge>
            )}
            {item.isNew && (
              <Badge 
                className="ml-auto bg-green-500 text-white"
              >
                New
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
