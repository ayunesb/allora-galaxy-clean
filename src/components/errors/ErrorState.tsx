
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  retry?: () => void;
  showDetails?: boolean;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * General purpose error state component
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while processing your request.',
  error,
  retry,
  showDetails = false,
  children,
  className,
  variant = 'destructive',
  size = 'md',
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'w-full',
  };
  
  return (
    <div className={cn("w-full p-4 flex flex-col items-center justify-center", className)}>
      <Alert variant={variant} className={cn("mb-4 w-full", sizeClasses[size])}>
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
          
          {showDetails && errorMessage && (
            <div className="mt-2 text-xs bg-destructive/10 p-2 rounded font-mono overflow-auto max-h-24">
              {errorMessage}
            </div>
          )}
          
          {children && <div className="mt-4">{children}</div>}
          
          {retry && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retry}
                className="bg-background hover:bg-background/90"
              >
                Try Again
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorState;
