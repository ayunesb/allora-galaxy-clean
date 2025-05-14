
import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from './separator';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

interface PageSidebarProps {
  children: React.ReactNode;
  className?: string;
}

// Main layout container
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

// Page header with title, description and optional actions
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 ml-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

// Flexible content area
export function PageContent({ children, className, fullWidth = false }: PageContentProps) {
  return (
    <div className={cn(
      "mt-6",
      fullWidth ? "w-full" : "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
      className
    )}>
      {children}
    </div>
  );
}

// Two-column layout with sidebar
export function PageWithSidebar({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 mt-6">
      {children}
    </div>
  );
}

// Sidebar container
export function PageSidebar({ children, className }: PageSidebarProps) {
  return (
    <aside className={cn("md:w-1/4 lg:w-1/5 flex-shrink-0", className)}>
      {children}
    </aside>
  );
}

// Main content area when using sidebar
export function PageMain({ children, className }: PageContentProps) {
  return (
    <main className={cn("flex-1", className)}>
      {children}
    </main>
  );
}

// Page section with title
export function PageSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center">
        <h2 className="text-lg font-medium">{title}</h2>
        <Separator className="flex-1 ml-4" />
      </div>
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
