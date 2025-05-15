
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  EmptyCircle, 
  Search, 
  FileQuestion, 
  ListFilter, 
  PlusCircle,
  List
} from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

/**
 * Base empty state component for displaying when no data is available
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <EmptyCircle className="h-8 w-8" />,
  action,
  className,
  size = 'md',
  children
}) => {
  const sizeClasses = {
    sm: 'p-4 max-w-sm',
    md: 'p-6 max-w-md',
    lg: 'p-8 max-w-lg'
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center border rounded-md bg-background",
      sizeClasses[size],
      className
    )}>
      <div className="mb-4 text-muted-foreground">
        {icon}
      </div>
      
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      
      {children}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

/**
 * Empty state for when no data exists or has been created
 */
export const NoDataEmptyState: React.FC<Omit<EmptyStateProps, 'icon'> & {
  createAction?: () => void;
  createLabel?: string;
}> = ({
  title = "No data found",
  description = "No items have been created yet.",
  createAction,
  createLabel = "Create new",
  ...props
}) => (
  <EmptyState
    title={title}
    description={description}
    icon={<FileQuestion className="h-8 w-8" />}
    action={createAction && (
      <Button onClick={createAction}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {createLabel}
      </Button>
    )}
    {...props}
  />
);

/**
 * Empty state for search results with no matches
 */
export const NoSearchResultsEmptyState: React.FC<Omit<EmptyStateProps, 'icon'> & {
  searchTerm?: string;
  onClear?: () => void;
}> = ({
  title = "No results found",
  description,
  searchTerm,
  onClear,
  ...props
}) => (
  <EmptyState
    title={title}
    description={description || (searchTerm ? `No results found for "${searchTerm}"` : "Try adjusting your search terms")}
    icon={<Search className="h-8 w-8" />}
    action={onClear && (
      <Button variant="outline" onClick={onClear}>
        Clear search
      </Button>
    )}
    {...props}
  />
);

/**
 * Empty state for when filters return no results
 */
export const FilterEmptyState: React.FC<Omit<EmptyStateProps, 'icon'> & {
  onResetFilters?: () => void;
}> = ({
  title = "No matching results",
  description = "Try adjusting or clearing your filters.",
  onResetFilters,
  ...props
}) => (
  <EmptyState
    title={title}
    description={description}
    icon={<ListFilter className="h-8 w-8" />}
    action={onResetFilters && (
      <Button variant="outline" onClick={onResetFilters}>
        Reset filters
      </Button>
    )}
    {...props}
  />
);

/**
 * Empty state specifically for cards
 */
export const CardEmptyState: React.FC<Omit<EmptyStateProps, 'className'>> = (props) => (
  <EmptyState
    className="h-full w-full border-dashed bg-muted/20"
    size="sm"
    {...props}
  />
);

/**
 * Empty state for lists
 */
export const EmptyListState: React.FC<Omit<EmptyStateProps, 'icon'>> = ({
  title = "No items",
  description = "There are no items in this list.",
  ...props
}) => (
  <EmptyState
    title={title}
    description={description}
    icon={<List className="h-8 w-8" />}
    size="sm"
    className="my-8 py-12"
    {...props}
  />
);
