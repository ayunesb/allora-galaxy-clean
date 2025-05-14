
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface EdgeFunctionErrorProps {
  error: Error & {
    statusCode?: number;
    code?: string;
    details?: any;
    requestId?: string;
    timestamp?: string;
  };
  retry?: () => void;
  showDetails?: boolean;
  showRequestId?: boolean;
}

/**
 * Specialized error component for edge function errors
 */
export const EdgeFunctionError: React.FC<EdgeFunctionErrorProps> = ({
  error,
  retry,
  showDetails = false,
  showRequestId = true,
}) => {
  const requestId = error.requestId || 'unknown';
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'UNKNOWN_ERROR';
  
  // Get appropriate error message based on status code
  const getErrorTitle = () => {
    switch (statusCode) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 429:
        return 'Too Many Requests';
      case 500:
        return 'Server Error';
      default:
        return 'Request Error';
    }
  };

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        <AlertDescription>
          <div className="mt-2">
            {error.message || "There was an error processing your request."}
          </div>
          
          {showRequestId && (
            <div className="mt-2 text-xs">
              Request ID: <code className="font-mono">{requestId}</code>
              {errorCode && (
                <>
                  <span className="mx-1">•</span>
                  Error Code: <code className="font-mono">{errorCode}</code>
                </>
              )}
            </div>
          )}
          
          {retry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retry}
              className="mt-3 bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
            >
              <RefreshCw className="mr-2 h-3 w-3" /> Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
      
      {showDetails && error.details && (
        <div className="rounded border p-3 bg-muted/20 text-xs font-mono overflow-auto max-h-40">
          <div className="text-muted-foreground mb-1">Error Details:</div>
          <pre>{typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

/**
 * Higher-order component to wrap a component with edge function error handling
 */
export function withEdgeFunctionErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallbackUI?: React.ReactNode;
    showDetails?: boolean;
    showRequestId?: boolean;
  } = {}
) {
  return function WithEdgeFunctionErrorHandling(props: P & { error?: any; retry?: () => void }) {
    const { error, retry, ...rest } = props;
    
    if (error) {
      return options.fallbackUI || (
        <EdgeFunctionError
          error={error}
          retry={retry}
          showDetails={options.showDetails}
          showRequestId={options.showRequestId}
        />
      );
    }
    
    return <Component {...rest as P} />;
  };
}

export default EdgeFunctionError;
