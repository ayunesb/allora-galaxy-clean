
import React, { memo } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | null;
  retry?: () => void;
  showDetails?: boolean;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  action?: React.ReactNode;
  className?: string;
}

/**
 * ErrorState - Standardized error display component
 * 
 * @param title - Error title
 * @param message - Error message
 * @param error - Error object
 * @param retry - Retry handler function
 * @param showDetails - Whether to show technical details
 * @param children - Additional content
 * @param size - Component size
 * @param action - Custom action element
 * @param className - Additional CSS classes
 */
export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Something went wrong",
  message = "We encountered an error while processing your request.",
  error,
  retry,
  showDetails = false,
  children,
  size = 'md',
  action,
  className = '',
}) => {
  // Size-based class mapping
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-6 text-center',
      sizeClasses[size],
      className
    )}>
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {message && <p className="text-muted-foreground mb-4">{message}</p>}
      
      {showDetails && error && (
        <div className="w-full mb-4 p-3 bg-muted rounded-md text-xs text-left overflow-auto">
          <p className="font-semibold">{error.message}</p>
          {error.stack && (
            <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
          )}
        </div>
      )}
      
      {children && <div className="mb-4">{children}</div>}
      
      {retry && (
        <button
          onClick={retry}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      )}
      
      {action && (
        <div className="mt-3">{action}</div>
      )}
    </div>
  );
};

// Export memoized component for performance optimization
export default memo(ErrorState);
