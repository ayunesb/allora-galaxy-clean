import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { FileSearch, SearchX, Filter, Package } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  image?: string;
  children?: ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  image,
  children,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
      {image && <img src={image} alt="Empty State" className="mb-4 w-32 h-32 object-contain" />}
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      {children}
    </div>
  );
};

interface NoDataEmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const NoDataEmptyState: React.FC<NoDataEmptyStateProps> = ({
  title = "No data available",
  description = "There is no data to display.",
  action,
  icon = <FileSearch className="w-6 h-6 text-muted-foreground mb-2" />,
  className
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      className={className}
    >
      {icon}
      {action}
    </EmptyState>
  );
};

interface NoSearchResultsEmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const NoSearchResultsEmptyState: React.FC<NoSearchResultsEmptyStateProps> = ({
  title = "No search results",
  description = "No results were found for your search query.",
  action,
  className
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      className={className}
    >
      <SearchX className="w-6 h-6 text-muted-foreground mb-2" />
      {action}
    </EmptyState>
  );
};

interface FilterEmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({
  title = "No results with these filters",
  description = "Adjust your filters to see results.",
  action,
  className
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      className={className}
    >
      <Filter className="w-6 h-6 text-muted-foreground mb-2" />
      {action}
    </EmptyState>
  );
};

interface CardEmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const CardEmptyState: React.FC<CardEmptyStateProps> = ({
  title = "Nothing to display",
  description = "There are no items to show in this card.",
  action,
  className
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      className={className}
    >
      <Package className="w-6 h-6 text-muted-foreground mb-2" />
      {action}
    </EmptyState>
  );
};

interface EmptyListStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EmptyListState: React.FC<EmptyListStateProps> = ({
  title = "List is empty",
  description = "There are no items in this list.",
  action,
  className
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      className={className}
    >
      <Package className="w-6 h-6 text-muted-foreground mb-2" />
      {action}
    </EmptyState>
  );
};

export {
  EmptyState,
  NoDataEmptyState,
  NoSearchResultsEmptyState,
  FilterEmptyState,
  CardEmptyState,
  EmptyListState
};
