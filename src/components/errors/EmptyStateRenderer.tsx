
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Filter, Search, FileWarning } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message: string;
  onReset: () => void;
  resetLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "No results found",
  message, 
  onReset,
  resetLabel = "Reset Filters" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <FileWarning className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button variant="outline" size="sm" onClick={onReset}>
        <RefreshCw className="mr-2 h-4 w-4" />
        {resetLabel}
      </Button>
    </div>
  );
};

interface FilteredEmptyStateProps {
  title?: string;
  message: string;
  onReset: () => void;
  resetLabel?: string;
}

export const FilteredEmptyState: React.FC<FilteredEmptyStateProps> = ({ 
  title = "No results match your filters",
  message,
  onReset,
  resetLabel = "Clear Filters" 
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Button variant="outline" onClick={onReset}>
            {resetLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface SearchEmptyStateProps {
  title?: string;
  message: string;
  onRefresh?: () => void;
  refreshLabel?: string;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ 
  title = "No search results",
  message,
  onRefresh,
  refreshLabel = "Reset Search" 
}) => {
  return (
    <Alert variant="default" className="my-6 bg-background">
      <Search className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p className="mb-4">{message}</p>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {refreshLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

interface EmptyStateRendererProps {
  isEmpty: boolean;
  isFiltered: boolean;
  title: string;
  message: string;
  resetFilters?: () => void;
  resetLabel?: string;
  action?: () => void;
  actionText?: string;
  children: React.ReactNode;
}

const EmptyStateRenderer: React.FC<EmptyStateRendererProps> = ({
  isEmpty,
  isFiltered,
  title,
  message,
  resetFilters,
  resetLabel = "Reset Filters",
  action,
  actionText,
  children
}) => {
  if (isEmpty) {
    if (isFiltered) {
      return (
        <FilteredEmptyState 
          title={title}
          message={message}
          onReset={resetFilters || (() => {})}
          resetLabel={resetLabel}
        />
      );
    }
    
    return (
      <SearchEmptyState 
        title={title}
        message={message}
        onRefresh={action}
        refreshLabel={actionText}
      />
    );
  }

  return <>{children}</>;
};

export default EmptyStateRenderer;
