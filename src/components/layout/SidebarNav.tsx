import { cn } from "@/lib/utils";
import { useTenantRole } from "@/hooks/useTenantRole";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavigationItem } from "@/types/shared";

interface SidebarNavProps {
  items: NavigationItem[];
  className?: string;
}

export function SidebarNav({ items, className }: SidebarNavProps) {
  const location = useLocation();
  const { hasRole } = useTenantRole();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  
  const isAdmin = hasRole(['admin', 'owner']);

  const toggleItem = (href: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const renderNavItem = (item: NavigationItem) => {
    // Skip admin-only items for non-admin users
    if (item.adminOnly && !isAdmin) {
      return null;
    }

    const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
    const hasChildren = item.items && item.items.length > 0;
    const isOpen = openItems[item.href];

    // If there are child items, render a collapsible menu
    if (hasChildren) {
      return (
        <div key={item.href} className="space-y-1">
          <button
            onClick={() => toggleItem(item.href)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "transparent",
              className
            )}
          >
            <span className="flex items-center">
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.title}
              {item.badge && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {item.badge}
                </span>
              )}
              {item.isNew && (
                <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                  New
                </span>
              )}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
            />
          </button>

          {isOpen && (
            <div className="pl-6 space-y-1">
              {item.items.map((child) =>
                renderNavItem(child)
              )}
            </div>
          )}
        </div>
      );
    }

    // Otherwise render a single nav item
    return (
      <Link
        key={item.href}
        to={item.href}
        target={item.isExternal ? "_blank" : undefined}
        rel={item.isExternal ? "noopener noreferrer" : undefined}
        className={cn(
          "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-accent-foreground",
          isActive ? "bg-accent text-accent-foreground" : "transparent",
          className
        )}
      >
        <span className="flex items-center">
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          {item.title}
        </span>
        <span className="flex items-center">
          {item.badge && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {item.badge}
            </span>
          )}
          {item.isNew && (
            <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
              New
            </span>
          )}
          {item.isExternal && (
            <span className="ml-1 h-1 w-1 rounded-full bg-foreground" />
          )}
        </span>
      </Link>
    );
  };

  return (
    <nav className={cn("space-y-1", className)}>
      {items.map((item) => renderNavItem(item))}
    </nav>
  );
}

export default SidebarNav;
