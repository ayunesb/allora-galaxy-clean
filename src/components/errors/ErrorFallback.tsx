
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { useToast } from '@/hooks/use-toast';
import { ErrorInfo } from 'react';
import ErrorState from '@/components/ui/error-state';

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo;
  resetErrorBoundary: () => void;
  supportEmail?: string;
}

export function ErrorFallback({ 
  error, 
  errorInfo, 
  resetErrorBoundary, 
  supportEmail
}: ErrorFallbackProps) {
  const { toast } = useToast();

  useEffect(() => {
    // Log the error to our system
    const tenantIdValue = 'system';
    
    logSystemEvent(
      'system',
      'error',
      {
        description: `React Error Boundary: ${error.message}`,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        react_error_boundary: true
      },
      tenantIdValue
    ).catch(console.error);
  }, [error, errorInfo]);

  const handleReportError = () => {
    toast({
      description: `Thank you for reporting this issue. Our team will investigate.${supportEmail ? ` You may also contact us at ${supportEmail}.` : ''}`,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto mt-10">
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          An error has occurred in the application. You can try reloading the page or report this issue.
        </AlertDescription>
      </Alert>

      <div className="bg-muted p-4 rounded-md mb-6 overflow-auto max-h-60">
        <p className="font-mono text-sm">{error.message}</p>
        {errorInfo && (
          <pre className="text-xs mt-2 text-muted-foreground">
            {errorInfo.componentStack}
          </pre>
        )}
      </div>

      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary} variant="default">
          Try Again
        </Button>
        <Button onClick={handleReportError} variant="outline">
          Report Issue
        </Button>
      </div>
    </div>
  );
}

export default ErrorFallback;
