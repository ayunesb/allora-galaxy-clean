
import React from 'react';
import { Button } from '@/components/ui/button';
import { InboxIcon, RefreshCw, FilterX, Search, CircleSlash } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: () => void;
  actionText?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <InboxIcon className="h-12 w-12 text-muted-foreground" />,
  action,
  actionText,
  className = "",
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    <div className="rounded-full bg-muted w-20 h-20 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium mt-2">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
    {action && actionText && (
      <Button onClick={action} className="mt-4">
        {actionText}
      </Button>
    )}
  </div>
);

interface NoDataEmptyStateProps {
  onRefresh?: () => void;
  customMessage?: string;
  className?: string;
}

export const NoDataEmptyState: React.FC<NoDataEmptyStateProps> = ({
  onRefresh,
  customMessage,
  className = "",
}) => (
  <EmptyState
    title="No Data Available"
    description={customMessage || "There is no data to display at this time."}
    icon={<CircleSlash className="h-12 w-12 text-muted-foreground" />}
    action={onRefresh}
    actionText={onRefresh ? "Refresh" : undefined}
    className={className}
  />
);

interface FilterEmptyStateProps {
  onClear?: () => void;
  customMessage?: string;
  className?: string;
}

export const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({
  onClear,
  customMessage,
  className = "",
}) => (
  <EmptyState
    title="No Results Found"
    description={customMessage || "Try adjusting your filters to find what you're looking for."}
    icon={<FilterX className="h-12 w-12 text-muted-foreground" />}
    action={onClear}
    actionText={onClear ? "Clear Filters" : undefined}
    className={className}
  />
);

export const NoSearchResultsEmptyState: React.FC<{ searchTerm?: string; className?: string }> = ({
  searchTerm,
  className = "",
}) => (
  <EmptyState
    title="No Search Results"
    description={searchTerm ? `No results found for "${searchTerm}"` : "No matching results found."}
    icon={<Search className="h-12 w-12 text-muted-foreground" />}
    className={className}
  />
);

export const CardEmptyState: React.FC<Omit<EmptyStateProps, 'className'>> = (props) => (
  <EmptyState {...props} className="bg-card border rounded-lg shadow-sm" />
);

export const EmptyListState: React.FC<EmptyStateProps> = (props) => (
  <EmptyState {...props} className="border rounded-md p-4" />
);
