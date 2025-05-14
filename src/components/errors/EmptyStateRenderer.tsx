
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
  action?: () => void;
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
          message={description}
          action={action}
          actionText={actionText}
        />
      );
    case 'no-search-results':
      return (
        <NoSearchResultsEmptyState
          searchTerm={searchTerm}
          resetSearch={resetSearch}
        />
      );
    case 'filter':
      return (
        <FilterEmptyState
          message={customMessage}
          resetFilters={resetFilters}
        />
      );
    case 'custom':
      return (
        <div className={`flex flex-col items-center justify-center p-6 text-center ${className || ''}`}>
          {icon && <div className="text-muted-foreground mb-3">{icon}</div>}
          {title && <h3 className="font-medium mb-1">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}
          {action && <button onClick={action} className="text-primary hover:underline">{actionText || 'Continue'}</button>}
        </div>
      );
    case 'standard':
    default:
      return (
        <EmptyState
          title={title || 'No Data'}
          message={description || 'No data available'}
          action={action}
          actionText={actionText}
        />
      );
  }
};

export default EmptyStateRenderer;
