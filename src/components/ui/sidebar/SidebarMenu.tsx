import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "./SidebarProvider";

export interface SidebarMenuProps {
  title: string;
  icon?: React.ReactNode;
  link?: string;
  children?: React.ReactNode;
  isActive?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export function SidebarMenu({
  title,
  icon,
  link,
  children,
  isActive = false,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onClick,
  badge,
  className,
}: SidebarMenuProps) {
  const { collapsed } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpenState, setIsOpen] = useState(defaultOpen);

  // Determine if isOpen is controlled or uncontrolled
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : isOpenState;

  // Toggle open state
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Handle click on menu item
  const handleClick = () => {
    if (link) {
      navigate(link);
    }
    if (children) {
      toggleOpen();
    }
    if (onClick) {
      onClick();
    }
  };

  // Determine if the current route matches the link
  const isActiveLink = isActive || (link && location.pathname === link);

  return (
    <div className={cn("flex flex-col", className)}>
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
          isActiveLink && "bg-accent text-accent-foreground font-medium",
          !collapsed ? "justify-start" : "justify-center",
        )}
      >
        {icon && (
          <span className={cn("shrink-0", !collapsed ? "mr-2" : "mr-0")}>
            {icon}
          </span>
        )}
        {!collapsed && <span className="flex-1 truncate">{title}</span>}
        {badge && !collapsed && <span className="ml-auto">{badge}</span>}
        {children && !collapsed && (
          <span className="ml-auto">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
      </button>

      {children && isOpen && !collapsed && (
        <div className="pl-6 mt-1">{children}</div>
      )}
    </div>
  );
}
