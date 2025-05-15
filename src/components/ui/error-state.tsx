
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | null;
  retry?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDetails?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading data',
  error,
  retry,
  size = 'md',
  className,
  showDetails = false
}: ErrorStateProps) {
  const sizeClasses = {
    sm: "py-4",
    md: "py-8",
    lg: "py-12"
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center px-4",
      sizeClasses[size],
      className
    )}>
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {showDetails && error?.message && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive max-w-md overflow-auto">
          <p className="font-medium mb-1">Error Details:</p>
          <p className="font-mono">{error.message}</p>
        </div>
      )}
      {retry && (
        <Button 
          variant="outline" 
          onClick={retry}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
