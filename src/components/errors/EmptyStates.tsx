
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSearch, Inbox, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-4 max-w-sm',
    md: 'p-8 max-w-md',
    lg: 'p-12 max-w-lg'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center bg-muted/40 rounded-lg",
      sizeClasses[size],
      className
    )}>
      <div className="rounded-full bg-muted p-3 mb-4">
        {icon || <Inbox className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
};

export const NoDataEmptyState: React.FC<{
  onRefresh?: () => void;
  className?: string;
  customMessage?: string;
}> = ({ 
  onRefresh, 
  className,
  customMessage
}) => (
  <EmptyState
    title="No data found"
    description={customMessage || "There are no items to display at this time."}
    icon={<AlertCircle className="h-8 w-8 text-muted-foreground" />}
    action={onRefresh && (
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    )}
    className={className}
  />
);

export const NoSearchResultsEmptyState: React.FC<{
  onClear: () => void;
  searchTerm: string;
  className?: string;
}> = ({ onClear, searchTerm, className }) => (
  <EmptyState
    title="No results found"
    description={`No items match your search "${searchTerm}". Try using different keywords or filters.`}
    icon={<FileSearch className="h-8 w-8 text-muted-foreground" />}
    action={
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear search
      </Button>
    }
    className={className}
  />
);

export const FilterEmptyState: React.FC<{
  onClear: () => void;
  className?: string;
}> = ({ onClear, className }) => (
  <EmptyState
    title="No matching items"
    description="No items match your current filters. Try adjusting or clearing your filters."
    icon={<Filter className="h-8 w-8 text-muted-foreground" />}
    action={
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear filters
      </Button>
    }
    className={className}
  />
);

export const CardEmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, description, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center text-center p-6", className)}>
    <div className="rounded-full bg-muted/60 p-2 mb-3">
      <Inbox className="h-5 w-5 text-muted-foreground" />
    </div>
    <h4 className="text-sm font-medium mb-1">{title}</h4>
    {description && (
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
    )}
    {action}
  </div>
);

export const EmptyListState: React.FC<{
  entityName: string;
  onCreate?: () => void;
  createLabel?: string;
  className?: string;
}> = ({ entityName, onCreate, createLabel, className }) => (
  <EmptyState
    title={`No ${entityName} found`}
    description={`Get started by creating your first ${entityName}.`}
    action={onCreate && (
      <Button variant="default" size="sm" onClick={onCreate}>
        {createLabel || `Create ${entityName}`}
      </Button>
    )}
    className={className}
  />
);
