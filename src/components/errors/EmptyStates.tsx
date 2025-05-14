
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  iconClassName?: string;
  title: string;
  message?: string;
  action?: (() => void) | string;
  actionText?: string;
  secondaryAction?: (() => void) | string;
  secondaryActionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconClassName,
  title,
  message,
  action,
  actionText,
  secondaryAction,
  secondaryActionText,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {icon && (
        <div className={cn("mb-4 text-muted-foreground", iconClassName)}>
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {message && <p className="mb-4 text-muted-foreground">{message}</p>}
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {action && (
            <Button 
              onClick={typeof action === 'function' ? action : undefined}
              {...(typeof action === 'string' ? { as: 'a', href: action } : {})}
            >
              {actionText || 'Continue'}
            </Button>
          )}
          
          {secondaryAction && (
            <Button 
              variant="outline"
              onClick={typeof secondaryAction === 'function' ? secondaryAction : undefined}
              {...(typeof secondaryAction === 'string' ? { as: 'a', href: secondaryAction } : {})}
            >
              {secondaryActionText || 'Cancel'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const NoDataEmptyState: React.FC<{
  message?: string;
  action?: () => void;
  actionText?: string;
}> = ({ message, action, actionText }) => {
  return (
    <EmptyState
      title="No Data Available"
      message={message || "There's no data to display right now."}
      action={action}
      actionText={actionText}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 15h18" />
          <path d="M9 9h.01" />
          <path d="M15 9h.01" />
        </svg>
      }
    />
  );
};

export const NoSearchResultsEmptyState: React.FC<{
  searchTerm?: string; 
  resetSearch?: () => void;
}> = ({ searchTerm, resetSearch }) => {
  return (
    <EmptyState
      title="No Results Found"
      message={searchTerm ? `We couldn't find any results for "${searchTerm}".` : "No matching results found."}
      action={resetSearch}
      actionText="Clear Search"
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      }
    />
  );
};

export const FilterEmptyState: React.FC<{
  message?: string;
  resetFilters?: () => void;
}> = ({ message, resetFilters }) => {
  return (
    <EmptyState
      title="No Matching Items"
      message={message || "None of the items match your current filters."}
      action={resetFilters}
      actionText="Reset Filters"
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      }
    />
  );
};

export const CardEmptyState: React.FC<{
  title: string;
  message?: string;
  action?: () => void;
  actionText?: string;
}> = ({ title, message, action, actionText }) => {
  return (
    <EmptyState
      title={title}
      message={message}
      action={action}
      actionText={actionText}
      iconClassName="size-6"
    />
  );
};

export const EmptyListState: React.FC<{
  title?: string; 
  message?: string;
  action?: () => void | string;
  actionText?: string;
}> = ({ 
  title = "No Items Yet", 
  message = "Get started by creating your first item", 
  action, 
  actionText = "Create Item" 
}) => {
  return (
    <EmptyState
      title={title}
      message={message}
      action={action}
      actionText={actionText}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      }
    />
  );
};
