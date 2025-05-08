
import React from 'react';
import { cn } from '@/lib/utils';

export interface SidebarLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarLayout({ children, className }: SidebarLayoutProps) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      {children}
    </div>
  );
}
