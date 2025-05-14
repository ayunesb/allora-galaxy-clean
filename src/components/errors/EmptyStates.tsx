
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileX, Search, FilterX } from 'lucide-react';

interface NoDataEmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  action?: () => void;
}

export const NoDataEmptyState: React.FC<NoDataEmptyStateProps> = ({
  title = 'No data available',
  message = 'There are no items to display',
  actionText,
  action
}) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4">
    <div className="rounded-full bg-muted p-3 mb-4">
      <FileX className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    {action && actionText && (
      <Button onClick={action}>{actionText}</Button>
    )}
  </div>
);

interface NoSearchResultsEmptyStateProps {
  searchTerm: string;
  clearSearch?: () => void;
  title?: string;
}

export const NoSearchResultsEmptyState: React.FC<NoSearchResultsEmptyStateProps> = ({
  searchTerm,
  clearSearch,
  title = 'No search results'
}) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4">
    <div className="rounded-full bg-muted p-3 mb-4">
      <Search className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">
      No results found for "{searchTerm}"
    </p>
    {clearSearch && (
      <Button variant="outline" onClick={clearSearch}>Clear Search</Button>
    )}
  </div>
);

interface FilterEmptyStateProps {
  resetFilters?: () => void;
  message?: string;
  resetLabel?: string;
  title?: string;
}

export const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({
  resetFilters,
  message = 'Try adjusting your filters to see more results',
  resetLabel = 'Reset Filters',
  title = 'No matching results'
}) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4">
    <div className="rounded-full bg-muted p-3 mb-4">
      <FilterX className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    {resetFilters && (
      <Button variant="outline" onClick={resetFilters}>{resetLabel}</Button>
    )}
  </div>
);

// Additional empty state components with title prop support
export const CardEmptyState = NoDataEmptyState;
export const EmptyListState = NoDataEmptyState;
export const EmptyState = NoDataEmptyState;
