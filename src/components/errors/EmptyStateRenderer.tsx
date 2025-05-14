
import React from 'react';
import {
  NoDataEmptyState,
  NoSearchResultsEmptyState,
  FilterEmptyState,
  CardEmptyState,
  EmptyListState,
  EmptyState
} from './EmptyStates';

export type EmptyStateType = 'no-data' | 'no-search-results' | 'filter' | 'card' | 'list' | 'custom';

export interface EmptyStateRendererProps {
  stateType: EmptyStateType;
  searchTerm?: string;
  onClear?: () => void;
  customMessage?: string;
  className?: string;
  filterCount?: number;
  actionText?: string;
  action?: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyStateRenderer: React.FC<EmptyStateRendererProps> = ({
  stateType,
  searchTerm = '',
  onClear,
  customMessage,
  className,
  filterCount = 0,
  actionText,
  action,
  title,
  description,
  icon,
}) => {
  // Generic props for all empty states
  const commonProps = {
    className,
    action,
    actionText,
  };

  switch (stateType) {
    case 'no-data':
      return (
        <NoDataEmptyState
          {...commonProps}
          message={customMessage || "No data available"}
        />
      );

    case 'no-search-results':
      return (
        <NoSearchResultsEmptyState
          searchTerm={searchTerm}
          resetSearch={onClear}
          className={className}
        />
      );

    case 'filter':
      return (
        <FilterEmptyState
          resetFilters={onClear || (() => {})}
          customMessage={customMessage}
          className={className}
          filterCount={filterCount}
        />
      );

    case 'card':
      return (
        <CardEmptyState
          title={title || "No Data"}
          message={customMessage || "No data available"}
          className={className}
          action={action}
          actionText={actionText}
        />
      );

    case 'list':
      return (
        <EmptyListState
          title={title || "No Items"}
          message={customMessage || "No items available"}
          className={className}
          action={action}
          actionText={actionText}
        />
      );

    case 'custom':
      return (
        <EmptyState
          title={title || "No Content"}
          description={description || customMessage || "No content available"}
          icon={icon}
          actionText={actionText}
          action={action}
          className={className}
        />
      );

    default:
      return (
        <NoDataEmptyState
          className={className}
          message={customMessage || "No data available"}
          action={action}
          actionText={actionText}
        />
      );
  }
};

export default EmptyStateRenderer;
