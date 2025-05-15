
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, FileX, Filter, RefreshCw, InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action
}) => (
  <div className="flex flex-col items-center justify-center text-center p-8 w-full">
    <div className="mb-4 rounded-full bg-muted p-3">{icon}</div>
    <h3 className="mb-2 text-lg font-medium">{title}</h3>
    <p className="mb-6 text-sm text-muted-foreground max-w-sm">{description}</p>
    {action && (
      <Button
        variant={action.variant || "default"}
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    )}
  </div>
);

export const CardEmptyState: React.FC<EmptyStateProps> = (props) => (
  <Card>
    <CardContent className="pt-6">
      <EmptyState {...props} />
    </CardContent>
  </Card>
);

export const NoDataEmptyState: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState
    icon={<FileX size={24} />}
    title="No data available"
    description="There is no data to display at this time."
    action={onRefresh ? {
      label: "Refresh",
      onClick: onRefresh,
      variant: "outline"
    } : undefined}
  />
);

export const NoSearchResultsEmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <EmptyState
    icon={<Search size={24} />}
    title="No results found"
    description="Try adjusting your search or filter to find what you're looking for."
    action={{
      label: "Reset filters",
      onClick: onReset,
      variant: "outline"
    }}
  />
);

export const FilterEmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <EmptyState
    icon={<Filter size={24} />}
    title="No matching items"
    description="No items match your current filter criteria."
    action={{
      label: "Clear filters",
      onClick: onReset,
      variant: "outline"
    }}
  />
);

export const EmptyListState: React.FC<{ message: string; onRefresh?: () => void }> = ({ 
  message, 
  onRefresh 
}) => (
  <div className="flex flex-col items-center justify-center p-6 text-center">
    <InboxIcon className="h-12 w-12 text-muted-foreground mb-4" />
    <p className="text-muted-foreground">{message}</p>
    {onRefresh && (
      <Button variant="outline" className="mt-4" onClick={onRefresh}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    )}
  </div>
);

export default EmptyState;
