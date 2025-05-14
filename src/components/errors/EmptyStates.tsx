
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Search } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: () => void;
  actionText?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  actionText = 'Add New',
  icon,
  className = '',
}) => {
  return (
    <Card className={`flex flex-col items-center text-center p-6 ${className}`}>
      <div className="bg-muted rounded-full p-3 mb-4">
        {icon || <AlertCircle className="h-6 w-6 text-muted-foreground" />}
      </div>
      <CardHeader className="pb-2 pt-0">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      {action && (
        <CardFooter className="pt-0">
          <Button onClick={action}>{actionText}</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export interface NoDataEmptyStateProps {
  message: string;
  action?: () => void;
  actionText?: string;
  className?: string;
}

export const NoDataEmptyState: React.FC<NoDataEmptyStateProps> = ({
  message,
  action,
  actionText = 'Refresh',
  className = '',
}) => {
  return (
    <div className={`p-8 text-center ${className}`}>
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="text-lg font-medium mb-2">No data available</h4>
      <p className="text-muted-foreground mb-4">{message}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export interface NoSearchResultsEmptyStateProps {
  searchTerm: string;
  onReset: () => void;
  className?: string;
}

export const NoSearchResultsEmptyState: React.FC<NoSearchResultsEmptyStateProps> = ({
  searchTerm,
  onReset,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center ${className}`}>
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="text-lg font-medium mb-2">No results found</h4>
      <p className="text-muted-foreground mb-4">
        No results found for "<strong>{searchTerm}</strong>"
      </p>
      <Button variant="outline" size="sm" onClick={onReset}>
        Clear search
      </Button>
    </div>
  );
};

export interface FilterEmptyStateProps {
  onClear: () => void;
  customMessage?: string;
  className?: string;
}

export const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({
  onClear,
  customMessage = 'No results match your current filters',
  className = '',
}) => {
  return (
    <div className={`p-8 text-center ${className}`}>
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="text-lg font-medium mb-2">No matching results</h4>
      <p className="text-muted-foreground mb-4">{customMessage}</p>
      <Button variant="outline" size="sm" onClick={onClear}>
        Reset filters
      </Button>
    </div>
  );
};

export interface CardEmptyStateProps {
  title: string;
  message: string;
  action?: () => void;
  actionText?: string;
  className?: string;
}

export const CardEmptyState: React.FC<CardEmptyStateProps> = ({
  title,
  message,
  action,
  actionText,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center text-center py-8 px-4 ${className}`}>
      <div className="bg-muted rounded-full p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export interface EmptyListStateProps {
  message: string;
  action?: () => void;
  actionText?: string;
  className?: string;
}

export const EmptyListState: React.FC<EmptyListStateProps> = ({
  message,
  action,
  actionText,
  className = '',
}) => {
  return (
    <div className={`py-12 px-4 text-center border rounded-lg bg-muted/10 ${className}`}>
      <p className="text-muted-foreground mb-4">{message}</p>
      {action && actionText && (
        <Button variant="outline" size="sm" onClick={action}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
