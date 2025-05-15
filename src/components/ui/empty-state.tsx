
import React, { ReactNode } from 'react';
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: "py-4",
    md: "py-8",
    lg: "py-12"
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center px-4",
      sizeClasses[size],
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
