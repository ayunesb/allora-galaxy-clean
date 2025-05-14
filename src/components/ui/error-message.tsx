
import React from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type ErrorSeverity = 'error' | 'warning' | 'info';

type ErrorMessageProps = {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  className?: string;
};

export function ErrorMessage({
  title,
  message,
  severity = 'error',
  onRetry,
  className,
}: ErrorMessageProps) {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[severity];
  
  const bgColors = {
    error: 'bg-destructive/10',
    warning: 'bg-yellow-500/10',
    info: 'bg-blue-500/10',
  };

  const borderColors = {
    error: 'border-destructive/30',
    warning: 'border-yellow-500/30',
    info: 'border-blue-500/30',
  };

  const textColors = {
    error: 'text-destructive',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div 
      className={cn(
        "rounded-md border p-4", 
        bgColors[severity], 
        borderColors[severity],
        className
      )}
    >
      <div className="flex items-start">
        <div className="shrink-0">
          <Icon className={cn("h-5 w-5", textColors[severity])} />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={cn("text-sm font-medium", textColors[severity])}>
              {title}
            </h3>
          )}
          <div className={cn("text-sm", title ? "mt-2" : "", severity === 'error' ? "text-destructive" : "text-muted-foreground")}>
            {message}
          </div>
          {onRetry && (
            <div className="mt-4">
              <Button 
                size="sm" 
                variant={severity === 'error' ? "destructive" : "outline"} 
                onClick={onRetry}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// For simple error states within components
export function SimpleErrorMessage({ message }: { message: string }) {
  return (
    <p className="text-sm text-destructive flex items-center">
      <XCircle className="h-4 w-4 mr-1" />
      {message}
    </p>
  );
}
