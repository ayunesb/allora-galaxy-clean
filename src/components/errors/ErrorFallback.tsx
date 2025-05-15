
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ReloadIcon } from '@radix-ui/react-icons';
import { AlertCircle } from 'lucide-react';

export interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
  tenantId?: string;
  moduleName?: string;
  showDetails?: boolean;
}

/**
 * Fallback component that renders when an error occurs
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  tenantId,
  moduleName,
  showDetails = false,
}) => {
  const errorMessage = error?.message || 'An unexpected error occurred';
  
  return (
    <Card className="w-full max-w-xl mx-auto my-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <CardTitle>{moduleName ? `Error in ${moduleName}` : 'Application Error'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="font-medium">{errorMessage}</p>
          {showDetails && error?.stack && (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Error details:</h4>
              <pre className="text-xs mt-2 p-3 bg-muted rounded-md overflow-auto">
                {error.stack}
              </pre>
            </div>
          )}
          {tenantId && (
            <div className="text-xs text-muted-foreground">
              Tenant ID: {tenantId}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {resetErrorBoundary && (
          <Button 
            onClick={resetErrorBoundary} 
            className="flex items-center space-x-1"
          >
            <ReloadIcon className="h-4 w-4 mr-1" />
            <span>Retry</span>
          </Button>
        )}
        <Button 
          variant="outline" 
          className="ml-2"
          onClick={() => window.location.reload()}
        >
          Refresh page
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorFallback;
