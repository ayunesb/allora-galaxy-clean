
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  RefreshCcw, 
  Search, 
  Info, 
  FileX, 
  Database, 
  CircleSlash
} from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <CircleSlash className="h-12 w-12 text-muted-foreground/60" />,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-muted-foreground max-w-sm mb-4">{description}</p>}
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export const NoResultsEmptyState: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
  <EmptyState
    icon={<Search className="h-12 w-12 text-muted-foreground/60" />}
    title="No results found"
    description="Try adjusting your search or filters to find what you're looking for."
    action={
      onReset
        ? {
            label: 'Reset filters',
            onClick: onReset,
          }
        : undefined
    }
  />
);

export const ErrorEmptyState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon={<AlertCircle className="h-12 w-12 text-destructive" />}
    title="Something went wrong"
    description="There was an error loading this content. Please try again."
    action={
      onRetry
        ? {
            label: 'Try again',
            onClick: onRetry,
          }
        : undefined
    }
  />
);

export const NoDataEmptyState: React.FC<{ onAction?: () => void; actionLabel?: string }> = ({
  onAction,
  actionLabel = 'Create new',
}) => (
  <EmptyState
    icon={<Database className="h-12 w-12 text-muted-foreground/60" />}
    title="No data available"
    description="There's no data to display here yet."
    action={
      onAction
        ? {
            label: actionLabel,
            onClick: onAction,
          }
        : undefined
    }
  />
);

export const NoAccessEmptyState: React.FC = () => (
  <EmptyState
    icon={<FileX className="h-12 w-12 text-destructive" />}
    title="Access denied"
    description="You don't have permission to access this resource."
  />
);

export const InfoEmptyState: React.FC<{
  title: string;
  description?: string;
}> = ({ title, description }) => (
  <EmptyState
    icon={<Info className="h-12 w-12 text-blue-500" />}
    title={title}
    description={description}
  />
);

export default EmptyState;
