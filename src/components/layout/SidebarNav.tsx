
import React from 'react';
import { cn } from "@/lib/utils";
import { NavLink } from 'react-router-dom';
import { NavigationItem } from '@/types/shared';

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
  return (
    <nav className={cn("flex flex-col gap-y-1", className)} {...props}>
      {items.map((item) => {
        const IconComponent = item.icon;

        if (item.items && item.items.length > 0) {
          return (
            <div key={item.id || item.href}>
              <span className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium",
                "text-slate-600 dark:text-slate-400",
                "hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              )}>
                {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                {item.title}
              </span>
              <div className="ml-4 mt-1">
                <SidebarNav 
                  items={item.items} 
                  setOpen={setOpen} 
                  hasNested={true} 
                />
              </div>
            </div>
          );
        }

        return (
          <NavLink
            key={item.id || item.href}
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
            {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
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

export default SidebarNav;
