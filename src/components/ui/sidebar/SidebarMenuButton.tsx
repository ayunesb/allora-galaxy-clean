import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarProvider";

export interface SidebarMenuButtonProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function SidebarMenuButton({
  children,
  className,
  asChild = false,
}: SidebarMenuButtonProps) {
  const { collapsed } = useSidebar();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-medium ring-offset-background transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        collapsed && "justify-center gap-x-0 p-2",
        className,
      )}
    >
      {children}
    </Comp>
  );
}
