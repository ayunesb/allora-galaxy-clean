
import React from 'react';
import { 
  FileText,
  Search,
  AlertTriangle,
  Database,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Generic Empty State component that can be used for various empty scenarios
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg ${className}`}>
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-4">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

/**
 * Empty state for when no data is available
 */
export const NoDataEmptyState: React.FC<{ onRefresh?: () => void, className?: string }> = ({ onRefresh, className = '' }) => {
  return (
    <EmptyState
      title="No data available"
      description="We couldn't find any data to display."
      icon={<Database className="h-12 w-12" />}
      className={className}
      action={onRefresh && (
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      )}
    />
  );
};

/**
 * Empty state for search results with no matches
 */
export const NoSearchResultsEmptyState: React.FC<{ searchTerm?: string, onClear?: () => void, className?: string }> = ({ 
  searchTerm, 
  onClear, 
  className = '' 
}) => {
  return (
    <EmptyState
      title="No results found"
      description={searchTerm ? `We couldn't find any results for "${searchTerm}".` : "No matching results found."}
      icon={<Search className="h-12 w-12" />}
      className={className}
      action={onClear && (
        <Button variant="outline" onClick={onClear}>
          Clear Search
        </Button>
      )}
    />
  );
};

/**
 * Empty state for when filtered data returns no results
 */
export const FilterEmptyState: React.FC<{ onReset?: () => void, className?: string }> = ({ 
  onReset, 
  className = '' 
}) => {
  return (
    <EmptyState
      title="No matching items"
      description="Try changing or resetting your filters to see more results."
      icon={<AlertTriangle className="h-12 w-12" />}
      className={className}
      action={onReset && (
        <Button variant="outline" onClick={onReset}>
          Reset Filters
        </Button>
      )}
    />
  );
};

/**
 * Empty state as a card component with a contained design
 */
export const CardEmptyState: React.FC<EmptyStateProps> = (props) => {
  return (
    <Card>
      <CardContent className="p-6">
        <EmptyState {...props} />
      </CardContent>
    </Card>
  );
};

/**
 * Empty state for when a list is empty
 */
export const EmptyListState: React.FC<{ entityName?: string, onAdd?: () => void, className?: string }> = ({ 
  entityName = 'items', 
  onAdd, 
  className = '' 
}) => {
  return (
    <EmptyState
      title={`No ${entityName} yet`}
      description={`You haven't added any ${entityName} yet. Get started by adding your first one.`}
      icon={<FileText className="h-12 w-12" />}
      className={className}
      action={onAdd && (
        <Button onClick={onAdd}>
          Add {entityName.slice(0, -1)}
        </Button>
      )}
    />
  );
};
