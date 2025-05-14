
import React from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps
} from 'react-error-boundary';
import { toast } from 'sonner';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTenantId } from '@/hooks/useTenantId';

export interface ErrorBoundaryFallbackProps extends FallbackProps {
  title?: string;
  description?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, info: { componentStack: string }) => void;
  onReset?: () => void;
  resetKeys?: any[];
  title?: string;
  description?: string;
}

// Default fallback component
const DefaultFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  description = 'An error occurred while rendering this component.'
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-destructive/5">
        <CardTitle className="flex items-center text-destructive">
          <AlertTriangle className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {process.env.NODE_ENV !== 'production' && (
          <div className="bg-muted p-2 rounded-md overflow-auto max-h-[200px]">
            <pre className="text-xs">{error.message}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={resetErrorBoundary}
          className="flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * Error boundary component with customizable fallback UI
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  onReset,
  resetKeys = [],
  title,
  description,
}) => {
  const tenantId = useTenantId();
  
  const handleError = React.useCallback(
    (error: Error, info: { componentStack: string }) => {
      // Log error to console
      console.error('ErrorBoundary caught error:', error);
      console.error('Component Stack:', info.componentStack);
      
      // Show toast notification
      toast.error('Component Error', {
        description: error.message || 'An error occurred in the application.'
      });
      
      // Call custom error handler if provided
      if (onError) {
        onError(error, info);
      }
    },
    [onError]
  );

  const FallbackComponent = fallback || DefaultFallback;

  return (
    <ReactErrorBoundary
      fallbackRender={(props) => (
        <FallbackComponent
          {...props}
          title={title}
          description={description}
        />
      )}
      onError={handleError}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
