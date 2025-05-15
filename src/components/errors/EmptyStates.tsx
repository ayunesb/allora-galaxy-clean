
import React from 'react';
import { Button } from '@/components/ui/button';
import { InboxIcon, ClipboardList, Search, AlertCircle, ShieldAlert, FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <div className="rounded-full bg-muted p-3 mb-4">
        {icon || <InboxIcon className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export const NoResultsEmptyState: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
  <EmptyState
    title="No results found"
    description="Try adjusting your search or filter to find what you're looking for."
    icon={<Search className="h-6 w-6 text-muted-foreground" />}
    action={
      onReset && (
        <Button variant="outline" onClick={onReset}>
          Reset filters
        </Button>
      )
    }
  />
);

export const ErrorEmptyState: React.FC<{ onRetry?: () => void; message?: string }> = ({ 
  onRetry, 
  message 
}) => (
  <EmptyState
    title="Error loading data"
    description={message || "We encountered a problem while loading this data."}
    icon={<AlertCircle className="h-6 w-6 text-destructive" />}
    action={
      onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )
    }
  />
);

export const NoDataEmptyState: React.FC<{ entityName?: string; onAdd?: () => void }> = ({ 
  entityName = "items", 
  onAdd 
}) => (
  <EmptyState
    title={`No ${entityName} yet`}
    description={`When you add ${entityName}, they'll appear here.`}
    icon={<ClipboardList className="h-6 w-6 text-muted-foreground" />}
    action={
      onAdd && (
        <Button onClick={onAdd}>
          Add {entityName}
        </Button>
      )
    }
  />
);

export const NoAccessEmptyState: React.FC = () => (
  <EmptyState
    title="Access restricted"
    description="You don't have permission to view this content."
    icon={<ShieldAlert className="h-6 w-6 text-warning" />}
  />
);

export const InfoEmptyState: React.FC<{ title: string; description?: string }> = ({ 
  title, 
  description 
}) => (
  <EmptyState
    title={title}
    description={description}
    icon={<FileQuestion className="h-6 w-6 text-primary" />}
  />
);
