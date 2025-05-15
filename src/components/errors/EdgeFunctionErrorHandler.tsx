
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlloraError, ApiError } from '@/lib/errors/errorTypes';

export interface EdgeFunctionErrorProps {
  error: Error | AlloraError | ApiError | {
    message: string;
    requestId?: string;
    code?: string;
    status?: number;
    timestamp?: string;
    details?: any;
  };
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
  showRequestId?: boolean;
  retry?: () => void;
}

/**
 * Extract standardized error information from different error types
 */
function normalizeError(error: EdgeFunctionErrorProps['error']): {
  message: string;
  requestId?: string;
  code?: string;
  status?: number;
  details?: any;
} {
  // Handle AlloraError type
  if (error instanceof AlloraError) {
    return {
      message: error.userMessage || error.message,
      requestId: error.requestId,
      code: error.code,
      status: error.status,
      details: error.context
    };
  }
  
  // Handle standard Error type
  if (error instanceof Error) {
    return {
      message: error.message,
      requestId: (error as any).requestId,
      code: (error as any).code,
      status: (error as any).status,
      details: (error as any).details
    };
  }
  
  // Handle object with message property
  if (typeof error === 'object' && error !== null) {
    return {
      message: error.message || 'Unknown error',
      requestId: 'requestId' in error ? error.requestId : undefined,
      code: 'code' in error ? error.code : undefined,
      status: 'status' in error ? error.status : undefined,
      details: 'details' in error ? error.details : undefined
    };
  }
  
  // Fallback for unknown error types
  return {
    message: String(error) || 'Unknown error'
  };
}

/**
 * A specialized component for displaying edge function errors
 */
export const EdgeFunctionError: React.FC<EdgeFunctionErrorProps> = ({
  error,
  onRetry,
  retry,
  showDetails = false,
  showRequestId = false,
  className
}) => {
  const normalizedError = normalizeError(error);
  
  // Format the error message based on status code
  const getErrorMessage = () => {
    const message = normalizedError.message;
    if (message) return message;
    
    const status = normalizedError.status || 500;
    
    switch (status) {
      case 401: return 'Unauthorized. Please sign in to continue.';
      case 403: return 'You don\'t have permission to access this resource.';
      case 404: return 'The requested resource was not found.';
      case 429: return 'Rate limit exceeded. Please try again later.';
      case 500: return 'A server error occurred. Please try again later.';
      default: return 'An unexpected error occurred.';
    }
  };

  const handleRetry = onRetry || retry;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg">Request Failed</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <p className="font-medium">{getErrorMessage()}</p>
          
          {(showRequestId || normalizedError.status === 500) && normalizedError.requestId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Request ID: <code className="font-mono">{normalizedError.requestId}</code>
            </p>
          )}
          
          {normalizedError.code && (
            <p className="text-xs text-muted-foreground">
              Error Code: <code className="font-mono">{normalizedError.code}</code>
            </p>
          )}
          
          {showDetails && normalizedError.details && (
            <div className="mt-2">
              <p className="text-xs font-medium">Error Details:</p>
              <pre className="mt-1 max-h-20 overflow-auto rounded bg-muted p-2 text-xs">
                {typeof normalizedError.details === 'object' 
                  ? JSON.stringify(normalizedError.details, null, 2) 
                  : String(normalizedError.details)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
      {handleRetry && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry} 
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

// Also alias EdgeFunctionErrorDisplay to EdgeFunctionError for backward compatibility
export const EdgeFunctionErrorDisplay = EdgeFunctionError;

// HOC for wrapping components with edge function error handling
export function withEdgeFunctionErrorHandling<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { error?: any; retry?: () => void; showDetails?: boolean }> {
  return ({ error, retry, showDetails, ...props }) => {
    if (error) {
      return <EdgeFunctionError error={error} retry={retry} showDetails={showDetails} />;
    }
    return <Component {...props as P} />;
  };
}

export { default as EdgeFunctionHandler } from './EdgeFunctionHandler';
