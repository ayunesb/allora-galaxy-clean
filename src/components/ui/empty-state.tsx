import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Props for the EmptyState component
 */
export interface EmptyStateProps {
  /** Main title text for the empty state */
  title: string;
  /** Description text explaining the empty state */
  description: string;
  /** Optional icon to display above the title */
  icon?: ReactNode;
  /** Optional call-to-action element (usually a button) */
  action?: ReactNode;
  /** Optional additional CSS classes */
  className?: string;
  /** Size variant controlling vertical spacing */
  size?: "sm" | "md" | "lg";
}

/**
 * EmptyState - A component for displaying empty states in lists, tables, or content areas
 *
 * @example
 * ```tsx
 * // Basic usage
 * <EmptyState
 *   title="No results found"
 *   description="Try adjusting your search or filters to find what you're looking for."
 * />
 *
 * // With icon and action
 * <EmptyState
 *   title="No projects created"
 *   description="Get started by creating your first project."
 *   icon={<FolderPlus className="h-12 w-12" />}
 *   action={<Button>Create Project</Button>}
 * />
 *
 * // With small size variant
 * <EmptyState
 *   title="No notifications"
 *   description="You're all caught up!"
 *   size="sm"
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: "py-4",
    md: "py-8",
    lg: "py-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-4",
        sizeClasses[size],
        className,
      )}
    >
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
