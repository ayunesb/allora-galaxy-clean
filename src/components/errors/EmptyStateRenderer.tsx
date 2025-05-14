
import React from 'react';
import { Button } from '@/components/ui/button';
import { NoDataEmptyState, NoSearchResultsEmptyState, FilterEmptyState } from './EmptyStates';
import { cn } from '@/lib/utils';

export interface EmptyStateRendererProps {
  type: 'no-data' | 'no-search-results' | 'no-filter-results' | 'custom';
  message?: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  onRefresh?: () => void;
  searchTerm?: string;
  onClear?: () => void;
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * EmptyStateRenderer - A component to consistently render different types of empty states
 */
export const EmptyStateRenderer: React.FC<EmptyStateRendererProps> = ({
  type,
  message,
  title,
  actionLabel,
  onAction,
  onRefresh,
  searchTerm = '',
  onClear,
  className,
  icon,
  children
}) => {
  switch (type) {
    case 'no-data':
      return (
        <NoDataEmptyState 
          onRefresh={onRefresh} 
          customMessage={message} 
          className={className}
        />
      );
    
    case 'no-search-results':
      if (!onClear || !searchTerm) {
        console.error('EmptyStateRenderer: onClear and searchTerm are required for no-search-results type');
        return <NoDataEmptyState customMessage="No results found" />;
      }
      return (
        <NoSearchResultsEmptyState 
          onClear={onClear} 
          searchTerm={searchTerm} 
          className={className}
        />
      );
    
    case 'no-filter-results':
      if (!onClear) {
        console.error('EmptyStateRenderer: onClear is required for no-filter-results type');
        return <NoDataEmptyState customMessage="No matching items" />;
      }
      return (
        <FilterEmptyState 
          onClear={onClear} 
          className={className}
        />
      );
    
    case 'custom':
      return (
        <div className={cn(
          "flex flex-col items-center justify-center text-center bg-muted/40 rounded-lg p-8",
          className
        )}>
          {icon && (
            <div className="rounded-full bg-muted p-3 mb-4">
              {icon}
            </div>
          )}
          {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
          {message && <p className="text-muted-foreground mb-4">{message}</p>}
          {children}
          {onAction && (
            <Button onClick={onAction}>
              {actionLabel || 'Continue'}
            </Button>
          )}
        </div>
      );
    
    default:
      return <NoDataEmptyState customMessage={message} />;
  }
};

export default EmptyStateRenderer;
