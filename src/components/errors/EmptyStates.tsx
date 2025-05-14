
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Filter, Package, XCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateBaseProps {
  className?: string;
  action?: () => void;
  actionText?: string;
}

interface EmptyStateProps extends EmptyStateBaseProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon,
  action,
  actionText,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed rounded-lg", className)}>
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-4">{description}</p>
      {action && actionText && (
        <Button onClick={action} variant="outline" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};

interface NoDataEmptyStateProps extends EmptyStateBaseProps {
  message?: string;
}

export const NoDataEmptyState: React.FC<NoDataEmptyStateProps> = ({
  message = "No data available",
  action,
  actionText,
  className,
}) => {
  return (
    <EmptyState
      title="No Data Available"
      description={message}
      icon={<Package className="h-12 w-12 opacity-20" />}
      action={action}
      actionText={actionText}
      className={className}
    />
  );
};

interface NoSearchResultsEmptyStateProps {
  searchTerm: string;
  resetSearch?: () => void;
  className?: string;
}

export const NoSearchResultsEmptyState: React.FC<NoSearchResultsEmptyStateProps> = ({
  searchTerm,
  resetSearch,
  className,
}) => {
  return (
    <EmptyState
      title="No Results Found"
      description={`No results found for "${searchTerm}". Try adjusting your search term.`}
      icon={<Search className="h-12 w-12 opacity-20" />}
      action={resetSearch}
      actionText={resetSearch ? "Clear Search" : undefined}
      className={className}
    />
  );
};

interface FilterEmptyStateProps {
  resetFilters: () => void;
  customMessage?: string;
  className?: string;
  filterCount?: number;
}

export const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({
  resetFilters,
  customMessage,
  className,
  filterCount = 0,
}) => {
  return (
    <EmptyState
      title="No Matching Results"
      description={customMessage || `No items match your current filters${filterCount ? ` (${filterCount} active)` : ''}.`}
      icon={<Filter className="h-12 w-12 opacity-20" />}
      action={resetFilters}
      actionText="Reset Filters"
      className={className}
    />
  );
};

interface CardEmptyStateProps extends EmptyStateBaseProps {
  title: string;
  message?: string;
}

export const CardEmptyState: React.FC<CardEmptyStateProps> = ({
  title,
  message,
  action,
  actionText,
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-6 bg-muted/10 border rounded-lg", className)}>
      <div className="text-muted-foreground mb-2">
        <XCircle className="h-8 w-8 opacity-30" />
      </div>
      <h4 className="font-medium mb-1">{title}</h4>
      {message && <p className="text-sm text-muted-foreground text-center mb-3">{message}</p>}
      {action && actionText && (
        <Button onClick={action} variant="outline" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};

interface EmptyListStateProps extends EmptyStateBaseProps {
  title: string;
  message?: string;
}

export const EmptyListState: React.FC<EmptyListStateProps> = ({
  title,
  message,
  action,
  actionText,
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-6 px-4 border border-dashed rounded-md", className)}>
      <Inbox className="h-8 w-8 text-muted-foreground opacity-50 mb-2" />
      <h4 className="font-medium mb-1">{title}</h4>
      {message && <p className="text-sm text-muted-foreground text-center mb-3">{message}</p>}
      {action && actionText && (
        <Button onClick={action} size="sm" variant="outline">
          {actionText}
        </Button>
      )}
    </div>
  );
};
