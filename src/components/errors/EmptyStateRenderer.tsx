
import React from 'react';
import { NoDataEmptyState, FilterEmptyState } from './EmptyStates';

interface EmptyStateRendererProps {
  message?: string;
  title?: string;
  actionLabel?: string;
  actionHandler?: () => void;
  resetFiltersHandler?: () => void;
  customContent?: React.ReactNode;
  isEmpty: boolean;
  isFiltered?: boolean;
  isSearching?: boolean;
  searchTerm?: string;
}

export const EmptyStateRenderer: React.FC<EmptyStateRendererProps> = ({
  message,
  title,
  actionLabel,
  actionHandler,
  resetFiltersHandler,
  customContent,
  isEmpty,
  isFiltered = false,
  isSearching = false,
  searchTerm = '',
}) => {
  if (!isEmpty) {
    return null;
  }

  // Determine appropriate empty state based on context
  if (customContent) {
    return <>{customContent}</>;
  }

  if (isSearching && searchTerm) {
    return (
      <FilterEmptyState
        title="No search results"
        message={`No results found for "${searchTerm}"`}
        resetFilters={resetFiltersHandler}
        resetLabel="Clear Search"
      />
    );
  }

  if (isFiltered) {
    return (
      <FilterEmptyState
        title={title || "No matching results"}
        message={message || "Try adjusting your filters to see more results"}
        resetFilters={resetFiltersHandler}
      />
    );
  }

  // Default no-data state
  return (
    <NoDataEmptyState
      title={title || "No data available"}
      message={message || "There are no items to display"}
      action={actionHandler}
      actionText={actionLabel}
    />
  );
};

export default EmptyStateRenderer;
