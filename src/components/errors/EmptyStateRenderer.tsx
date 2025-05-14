
import React, { ReactNode } from 'react';
import { NoDataEmptyState, NoSearchResultsEmptyState, FilterEmptyState, EmptyState } from './EmptyStates';

export interface EmptyStateConfig {
  type: 'no-data' | 'no-search-results' | 'filter' | 'custom' | 'standard';
  title?: string;
  description?: string;
  searchTerm?: string;
  resetSearch?: () => void;
  filters?: string[];
  filterCount?: number;
  resetFilters?: () => void;
  customMessage?: string;
  icon?: ReactNode;
  action?: ReactNode;
  actionText?: string;
  className?: string;
}

interface EmptyStateRendererProps {
  config: EmptyStateConfig;
}

/**
 * Component that renders the appropriate empty state based on the provided configuration
 */
const EmptyStateRenderer: React.FC<EmptyStateRendererProps> = ({ config }) => {
  const {
    type,
    title,
    description,
    searchTerm,
    resetSearch,
    filters,
    filterCount = 0,
    resetFilters,
    customMessage,
    icon,
    action,
    actionText,
    className
  } = config;

  switch (type) {
    case 'no-data':
      return (
        <NoDataEmptyState
          title={title}
          description={description}
          action={action}
          actionText={actionText}
          className={className}
        />
      );
    case 'no-search-results':
      return (
        <NoSearchResultsEmptyState
          title={title}
          description={description}
          searchTerm={searchTerm}
          resetSearch={resetSearch}
          className={className}
        />
      );
    case 'filter':
      return (
        <FilterEmptyState
          title={title}
          description={description}
          filters={filters}
          filterCount={filterCount}
          resetFilters={resetFilters}
          customMessage={customMessage}
          className={className}
        />
      );
    case 'custom':
      return (
        <div className={`flex flex-col items-center justify-center p-6 text-center ${className || ''}`}>
          {icon && <div className="text-muted-foreground mb-3">{icon}</div>}
          {title && <h3 className="font-medium mb-1">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}
          {action}
        </div>
      );
    case 'standard':
    default:
      return (
        <EmptyState
          title={title || 'No Data'}
          description={description || 'No data available'}
          action={action}
        />
      );
  }
};

export default EmptyStateRenderer;
