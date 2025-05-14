
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export interface EdgeFunctionErrorProps {
  error: {
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
}

/**
 * A specialized component for displaying edge function errors
 */
export const EdgeFunctionErrorDisplay: React.FC<EdgeFunctionErrorProps> = ({
  error,
  onRetry,
  showDetails = false,
  className
}) => {
  // Format the error message based on status code
  const getErrorMessage = () => {
    const status = error.status || 500;
    
    if (error.message) return error.message;
    
    switch (status) {
      case 401: return 'Unauthorized. Please sign in to continue.';
      case 403: return 'You don\'t have permission to access this resource.';
      case 404: return 'The requested resource was not found.';
      case 429: return 'Rate limit exceeded. Please try again later.';
      case 500: return 'A server error occurred. Please try again later.';
      default: return 'An unexpected error occurred.';
    }
  };

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
          
          {error.requestId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Request ID: <code className="font-mono">{error.requestId}</code>
            </p>
          )}
          
          {error.code && (
            <p className="text-xs text-muted-foreground">
              Error Code: <code className="font-mono">{error.code}</code>
            </p>
          )}
          
          {showDetails && error.details && (
            <div className="mt-2">
              <p className="text-xs font-medium">Error Details:</p>
              <pre className="mt-1 max-h-20 overflow-auto rounded bg-muted p-2 text-xs">
                {typeof error.details === 'object' 
                  ? JSON.stringify(error.details, null, 2) 
                  : String(error.details)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
      {onRetry && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry} 
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Retry
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default EdgeFunctionErrorDisplay;
