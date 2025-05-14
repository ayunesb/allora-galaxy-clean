import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retryable?: boolean;
  onRetry?: () => void;
  retry?: boolean;
  isRetrying?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'inline' | 'card' | 'minimal';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  details?: React.ReactNode;
  error?: Error;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  retryable = false,
  onRetry,
  retry = false,
  isRetrying = false,
  className,
  children,
  variant = 'default',
  icon,
  size = 'md',
  showDetails = false,
  details,
  error
}) => {
  // Handle retry action
  const handleRetry = async () => {
    if (onRetry) {
      await onRetry();
    }
  };
  
  // Determine the default icon based on variant
  const defaultIcon = (
    <AlertCircle className={cn(
      size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6',
      variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
    )} />
  );
  
  // Content based on variant
  const content = (
    <>
      <div className={cn(
        "flex items-start",
        variant === 'inline' ? 'flex-row' : 'flex-col'
      )}>
        {/* Icon */}
        <div className={cn(
          variant === 'inline' ? 'mr-2 mt-1' : 'mb-2',
          variant === 'minimal' && 'hidden'
        )}>
          {icon || defaultIcon}
        </div>
        
        {/* Text content */}
        <div className={cn(
          "flex flex-col",
          variant === 'inline' ? 'space-y-0' : 'space-y-1'
        )}>
          {title && (
            <h3 className={cn(
              "font-medium",
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
              variant === 'destructive' && 'text-destructive'
            )}>
              {title}
            </h3>
          )}
          
          {message && (
            <p className={cn(
              "text-muted-foreground",
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
            )}>
              {message}
            </p>
          )}
          
          {/* Custom content */}
          {children}
          
          {/* Error details */}
          {showDetails && (error || details) && (
            <details className="mt-2 text-sm text-muted-foreground">
              <summary className="cursor-pointer">Show details</summary>
              <div className="mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
                {details || (
                  <pre className="whitespace-pre-wrap text-xs">{error?.stack || error?.message}</pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
      
      {/* Retry button */}
      {(retryable || retry) && onRetry && (
        <div className={cn(
          "mt-2",
          variant === 'inline' && 'ml-6'
        )}>
          <Button
            variant="outline"
            size={size === 'sm' ? 'sm' : 'default'}
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
  
  // Wrap in a card if variant is 'card'
  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="p-4 sm:p-6">
          {content}
        </CardContent>
      </Card>
    );
  }
  
  // Otherwise return the content with appropriate styling
  return (
    <div className={cn(
      "w-full",
      variant === 'destructive' ? 'text-destructive' : '',
      variant === 'default' ? 'p-4 border rounded-md bg-background' : '',
      variant === 'minimal' ? '' : '',
      className
    )}>
      {content}
    </div>
  );
};

export default ErrorState;
