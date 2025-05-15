
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface EdgeFunctionErrorProps {
  error: Error | null;
  message?: string;
  showDetails?: boolean;
  onRetry?: () => void;
}

// Export the EdgeFunctionError component for testing
export const EdgeFunctionError: React.FC<EdgeFunctionErrorProps> = ({
  error,
  message = 'An error occurred while processing your request',
  showDetails = false,
  onRetry
}) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {message}
        {showDetails && (
          <div className="mt-2 text-sm text-gray-500">
            <p>{error.message}</p>
          </div>
        )}
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export interface EdgeFunctionErrorDisplayProps {
  error: Error | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

// Export the EdgeFunctionErrorDisplay component for testing
export const EdgeFunctionErrorDisplay: React.FC<EdgeFunctionErrorDisplayProps> = ({
  error,
  title = 'Operation Failed',
  description = 'There was an error processing your request',
  onRetry,
  retryLabel = 'Try Again'
}) => {
  if (!error) return null;

  return (
    <Card className="border-destructive/50 bg-destructive/10">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <AlertCircle className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>{description}</p>
        <div className="rounded bg-muted/50 p-2 text-xs font-mono overflow-auto">
          {error.message}
        </div>
      </CardContent>
      {onRetry && (
        <CardFooter>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

interface EdgeFunctionErrorHandlerProps {
  error: Error | null;
  isLoading?: boolean;
  children: React.ReactNode;
  onRetry?: () => void;
}

const EdgeFunctionErrorHandler: React.FC<EdgeFunctionErrorHandlerProps> = ({
  error,
  isLoading = false,
  children,
  onRetry
}) => {
  if (error) {
    return <EdgeFunctionError error={error} onRetry={onRetry} />;
  }

  return <>{children}</>;
};

export default EdgeFunctionErrorHandler;
