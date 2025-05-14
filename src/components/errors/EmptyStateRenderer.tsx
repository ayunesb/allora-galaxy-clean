
import React from 'react';
import { 
  EmptyState, 
  NoDataEmptyState,
  FilterEmptyState,
  NoSearchResultsEmptyState
} from './EmptyStates';

export interface EmptyStateRendererProps {
  isEmpty: boolean;
  isFiltered?: boolean;
  isSearching?: boolean;
  searchTerm?: string;
  filterCount?: number;
  loading?: boolean;
  error?: any;
  emptyStateProps?: React.ComponentProps<typeof EmptyState>;
  noDataEmptyStateProps?: React.ComponentProps<typeof NoDataEmptyState>;
  noSearchResultsEmptyStateProps?: React.ComponentProps<typeof NoSearchResultsEmptyState>;
  noFilterResultsEmptyStateProps?: React.ComponentProps<typeof FilterEmptyState>;
  className?: string;
  children?: React.ReactNode;
  onClear?: () => void;
}

export const EmptyStateRenderer: React.FC<EmptyStateRendererProps> = ({
  isEmpty,
  isFiltered = false,
  isSearching = false,
  searchTerm = '',
  filterCount = 0,
  loading = false,
  error,
  emptyStateProps,
  noDataEmptyStateProps,
  noSearchResultsEmptyStateProps,
  noFilterResultsEmptyStateProps,
  className,
  children,
  onClear,
}) => {
  // Don't show empty state if we're loading
  if (loading) return null;
  
  // Don't show empty state if there's an error (error component will handle this)
  if (error) return null;
  
  // If there is data, just render children
  if (!isEmpty) return <>{children}</>;
  
  // Show appropriate empty state based on context
  if (isSearching && searchTerm) {
    return (
      <NoSearchResultsEmptyState
        searchTerm={searchTerm}
        className={className}
        {...noSearchResultsEmptyStateProps}
      />
    );
  }
  
  if (isFiltered && filterCount > 0) {
    return (
      <FilterEmptyState
        onClear={onClear}
        filterCount={filterCount}
        className={className}
        {...noFilterResultsEmptyStateProps}
      />
    );
  }
  
  // Default empty state
  return (
    <EmptyState
      className={className}
      {...emptyStateProps}
    />
  );
};

export default EmptyStateRenderer;
