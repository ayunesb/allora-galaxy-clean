
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchX, Filter, FolderX, AlertCircle } from 'lucide-react';

export interface NoDataEmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  actionText?: string;
  className?: string;
}

export const NoDataEmptyState: React.FC<NoDataEmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There is no data available to display at this time.',
  action,
  actionText,
  className
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<FolderX className="h-10 w-10" />}
      action={actionText && action ? (
        <Button onClick={typeof action === 'function' ? action : undefined}>
          {actionText}
        </Button>
      ) : action}
    />
  );
};

export interface NoSearchResultsEmptyStateProps {
  title?: string;
  description?: string;
  searchTerm?: string;
  resetSearch?: () => void;
  className?: string;
}

export const NoSearchResultsEmptyState: React.FC<NoSearchResultsEmptyStateProps> = ({
  title = 'No Results Found',
  description,
  searchTerm = '',
  resetSearch,
  className
}) => {
  const defaultDescription = searchTerm 
    ? `No results found for "${searchTerm}". Try a different search term.` 
    : 'No results match your search criteria.';

  return (
    <EmptyState
      title={title}
      description={description || defaultDescription}
      icon={<SearchX className="h-10 w-10" />}
      action={resetSearch ? (
        <Button variant="outline" onClick={resetSearch}>
          Clear Search
        </Button>
      ) : null}
    />
  );
};

export interface FilterEmptyStateProps {
  title?: string;
  description?: string;
  filters?: string[];
  filterCount?: number;
  customMessage?: string;
  resetFilters?: () => void;
  className?: string;
}

export const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({
  title = 'No Matching Results',
  description,
  filters = [],
  filterCount = 0,
  customMessage,
  resetFilters,
  className
}) => {
  const getDefaultDescription = () => {
    if (customMessage) return customMessage;
    if (filters && filters.length > 0) {
      return `No results match your ${filters.join(', ')} filters.`;
    }
    return `No results match your applied filters (${filterCount} active).`;
  };

  return (
    <EmptyState
      title={title}
      description={description || getDefaultDescription()}
      icon={<Filter className="h-10 w-10" />}
      action={resetFilters ? (
        <Button variant="outline" onClick={resetFilters}>
          Clear Filters
        </Button>
      ) : null}
    />
  );
};

export interface CardEmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const CardEmptyState: React.FC<CardEmptyStateProps> = ({
  title = 'No Data',
  description = 'No data available to display.',
  icon = <AlertCircle className="h-8 w-8" />,
  action,
  className
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className || ''}`}>
      <div className="text-muted-foreground mb-3">{icon}</div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      {action}
    </div>
  );
};

export interface EmptyListStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const EmptyListState: React.FC<EmptyListStateProps> = ({
  title = 'No Items',
  description = 'There are no items to display.',
  action,
  icon = <FolderX className="h-10 w-10" />,
  className
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={icon}
      action={action}
    />
  );
};

export { EmptyState } from '@/components/ui/EmptyState';
