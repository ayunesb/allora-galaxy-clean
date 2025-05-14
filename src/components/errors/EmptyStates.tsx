
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, X, RefreshCw, Filter, FileX, Database, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Base empty state props
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: () => void;
  actionText?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  actionText = 'Try Again',
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 px-4 text-center", className)}>
      {icon && (
        <div className="rounded-full bg-muted p-3 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action} variant="outline" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export interface NoDataEmptyStateProps {
  message?: string;
  action?: () => void;
  actionText?: string;
  className?: string;
}

export const NoDataEmptyState: React.FC<NoDataEmptyStateProps> = ({
  message = "No data available",
  action,
  actionText,
  className,
}) => {
  return (
    <EmptyState
      title="No Data Found"
      description={message}
      icon={<Database className="h-6 w-6 text-muted-foreground" />}
      action={action}
      actionText={actionText}
      className={className}
    />
  );
};

export interface NoSearchResultsEmptyStateProps {
  searchTerm?: string;
  onClear?: () => void;
  className?: string;
}

export const NoSearchResultsEmptyState: React.FC<NoSearchResultsEmptyStateProps> = ({
  searchTerm = "",
  onClear,
  className,
}) => {
  return (
    <EmptyState
      title="No Results Found"
      description={`No items matching "${searchTerm}" were found.`}
      icon={<Search className="h-6 w-6 text-muted-foreground" />}
      action={onClear}
      actionText="Clear Search"
      className={className}
    />
  );
};

export interface FilterEmptyStateProps {
  onClear?: () => void;
  customMessage?: string;
  className?: string;
  filterCount?: number;
}

export const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({
  onClear,
  customMessage,
  className,
  filterCount = 0,
}) => {
  return (
    <EmptyState
      title="No Matching Results"
      description={
        customMessage || 
        `No items match the selected filters${filterCount > 0 ? ` (${filterCount} active)` : ''}.`
      }
      icon={<Filter className="h-6 w-6 text-muted-foreground" />}
      action={onClear}
      actionText="Clear Filters"
      className={className}
    />
  );
};

export interface CardEmptyStateProps {
  title?: string;
  message?: string;
  className?: string;
  action?: () => void;
  actionText?: string;
}

export const CardEmptyState: React.FC<CardEmptyStateProps> = ({
  title = "No Data Available",
  message = "There is no data to display at this time.",
  className,
  action,
  actionText,
}) => {
  return (
    <EmptyState
      title={title}
      description={message}
      icon={<FileX className="h-6 w-6 text-muted-foreground" />}
      action={action}
      actionText={actionText}
      className={cn("py-6", className)}
    />
  );
};

export interface EmptyListStateProps {
  title?: string;
  message?: string;
  action?: () => void;
  actionText?: string;
  className?: string;
}

export const EmptyListState: React.FC<EmptyListStateProps> = ({
  title = "Nothing Here Yet",
  message = "No items have been added yet.",
  action,
  actionText,
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={message}
      icon={<AlertTriangle className="h-6 w-6 text-muted-foreground" />}
      action={action}
      actionText={actionText}
      className={className}
    />
  );
};
