
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  supportEmail?: string;
  tenant_id?: string;
}

/**
 * A reusable error fallback component that provides consistent error presentation
 * Use with ErrorBoundary from 'react-error-boundary' for component-level error handling
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = "Something went wrong",
  supportEmail = "support@example.com",
  tenant_id = "system"
}) => {
  React.useEffect(() => {
    // Log the error to system logs
    logSystemEvent(
      tenant_id,
      'error',
      'React component error',
      {
        message: error.message,
        stack: error.stack,
        componentError: true
      }
    );
  }, [error, tenant_id]);

  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Application Error</AlertTitle>
            <AlertDescription>
              {error.message || 'An unexpected error occurred.'}
            </AlertDescription>
          </Alert>
          <p className="text-muted-foreground mb-4">
            Sorry for the inconvenience. We've logged this error and will resolve it as soon as possible.
          </p>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button onClick={handleReload} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <a href={`mailto:${supportEmail}`}>Contact Support</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorFallback;
