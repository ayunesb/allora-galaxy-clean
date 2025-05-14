
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import ErrorState from '@/components/errors/ErrorState';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentStack?: string | null;
}

/**
 * A fallback component displayed when an error is caught by an error boundary
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  componentStack,
}) => {
  // Log the error to system events
  React.useEffect(() => {
    // Log the error
    logSystemEvent('ui', 'error', {
      description: `UI Error: ${error.message}`,
      stack: error.stack,
      componentStack,
      react_error_boundary: true
    }).catch(logError => {
      console.error('Failed to log error to system events:', logError);
    });
  }, [error, componentStack]);

  return (
    <ErrorState
      title="Something went wrong"
      message="We encountered an unexpected error. Our team has been notified."
      error={error}
      retry={resetErrorBoundary}
      showDetails={true}
    >
      <div className="mt-2 text-xs text-muted-foreground">
        Please try again or contact support if the problem persists.
      </div>
    </ErrorState>
  );
};

export default ErrorFallback;
