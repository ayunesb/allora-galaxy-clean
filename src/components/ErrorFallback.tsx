
import React from 'react';
import { useErrorHandler } from '@/lib/errors/useErrorHandler';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  tenantId?: string;
}

/**
 * Fallback component displayed when an error occurs within an ErrorBoundary
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  tenantId = 'system'
}) => {
  const { handleReportError, isReporting } = useErrorHandler();
  const { toast } = useToast();

  /**
   * Handle reporting the error to the system
   */
  const reportError = async () => {
    try {
      await handleReportError(error, {
        context: {
          component: 'ErrorFallback',
          location: window.location.pathname
        },
        tenantId
      });
      
      toast({
        title: 'Error Reported',
        description: 'Thank you for reporting this error. Our team has been notified.'
      });
    } catch (reportError) {
      toast({
        variant: 'destructive',
        title: 'Failed to Report Error',
        description: 'There was an error reporting this issue. Please try again later.'
      });
      console.error('Error reporting error:', reportError);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          We've encountered an unexpected error. Our team has been notified.
        </AlertDescription>
      </Alert>
      
      <div className="mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold mb-2">Error details:</h3>
        <pre className="bg-muted p-4 rounded-md text-xs whitespace-pre-wrap">
          {error.message || 'An unknown error occurred'}
          {error.stack && (
            <>
              <br /><br />
              {error.stack}
            </>
          )}
        </pre>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {resetErrorBoundary && (
          <Button onClick={resetErrorBoundary} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={reportError} 
          disabled={isReporting}
          className="flex items-center gap-2"
        >
          {isReporting ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Reporting...
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              Report Issue
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ErrorFallback;
