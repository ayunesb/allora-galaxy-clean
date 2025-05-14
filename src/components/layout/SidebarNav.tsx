import React from 'react';
import { cn } from "@/lib/utils";
import { NavLink } from 'react-router-dom';
import { NavigationItem } from '@/types/shared';

// Define the correct type for icon prop - expecting a React component or string
type IconProp = React.ComponentType<any> | string | undefined;

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: NavigationItem[];
  setOpen?: (open: boolean) => void;
  hasNested?: boolean;
}

export function SidebarNav({
  className,
  items,
  setOpen,
  hasNested = false,
  ...props
}: SidebarNavProps) {
  // Convert an item.icon from ReactNode to a proper icon component
  const renderIcon = (icon: React.ReactNode): IconProp => {
    // If icon is a valid component or string, return it
    if (React.isValidElement(icon) || typeof icon === 'string') {
      return icon as IconProp;
    }
    // Otherwise return undefined
    return undefined;
  };

  return (
    <nav className={cn("flex flex-col gap-y-1", className)} {...props}>
      {items.map((item) => {
        // Get a proper icon component from the ReactNode
        const Icon = renderIcon(item.icon);

        if (item.items && item.items.length > 0) {
          return (
            <div key={item.id}>
              <span className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium",
                "text-slate-600 dark:text-slate-400",
                "hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              )}>
                {Icon && typeof Icon !== 'string' && <Icon className="mr-2 h-4 w-4" />}
                {item.title}
              </span>
              <div className="ml-4 mt-1">
                <SidebarNav items={item.items} setOpen={setOpen} hasNested />
              </div>
            </div>
          );
        }

        return (
          <NavLink
            key={item.id}
            to={item.href}
            onClick={() => setOpen?.(false)}
            className={({ isActive }) => cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
              isActive
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
              !hasNested && "mx-2"
            )}
          >
            {Icon && typeof Icon !== 'string' && <Icon className="mr-2 h-4 w-4" />}
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
