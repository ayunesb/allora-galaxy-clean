import React from "react";
import { useSidebar } from "./SidebarProvider";
import { cn } from "@/lib/utils";
import { SIDEBAR_WIDTH } from "./SidebarProvider";

interface SidebarProps {
  children?: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const { collapsed, setIsHovering } = useSidebar();

  return (
    <div
      data-collapsed={collapsed}
      className={cn(
        "group relative flex flex-col h-full border-r bg-background",
        collapsed ? "w-16" : `w-[${SIDEBAR_WIDTH}px]`,
        className,
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
    </div>
  );
}
