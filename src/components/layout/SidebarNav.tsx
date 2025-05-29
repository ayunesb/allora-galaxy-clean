import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/types/navigation";
import * as LucideIcons from "lucide-react";

interface SidebarNavProps {
  items: NavigationItem[];
  className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, className }) => {
  const location = useLocation();

  // Function to render icon
  const renderIcon = (icon?: React.ComponentType<any> | string) => {
    if (!icon) return null;

    // If icon is a component (React component)
    if (typeof icon !== "string") {
      const IconComponent = icon;
      return <IconComponent className="h-4 w-4" />;
    }

    // If icon is a string (name of Lucide icon)
    // Use type assertion to avoid compatibility issues with the index signature
    const IconComponent = (
      LucideIcons as unknown as Record<string, React.ComponentType<any>>
    )[icon];

    if (IconComponent) {
      return <IconComponent className="h-4 w-4" />;
    }

    return null;
  };

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const isActive =
          location.pathname === item.href ||
          location.pathname.startsWith(`${item.href}/`);
        const itemKey = item.href || item.title;

        if (!item.href) {
          return (
            <div
              key={itemKey}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground"
            >
              {item.icon && (
                <span className="h-4 w-4">{renderIcon(item.icon)}</span>
              )}
              <span>{item.title}</span>
            </div>
          );
        }

        return (
          <Link
            key={itemKey}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.icon && (
              <span className="h-4 w-4">{renderIcon(item.icon)}</span>
            )}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
