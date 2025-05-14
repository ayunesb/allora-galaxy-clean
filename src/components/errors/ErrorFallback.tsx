
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError } from '@/lib/notifications/toast';

export interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo | null;
  resetErrorBoundary: () => void;
  tenantId?: string;
}

/**
 * Default error fallback component for error boundaries
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  resetErrorBoundary, 
  tenantId = 'system' 
}) => {
  const handleResetAndNotify = () => {
    notifyError('Recovering from error', { 
      description: 'The application has recovered from an error. Some data may have been lost.'
    });
    resetErrorBoundary();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="text-red-600 dark:text-red-400 h-5 w-5" />
          <CardTitle>Something went wrong</CardTitle>
        </div>
        <CardDescription>
          The application encountered an unexpected error. Our team has been notified.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md overflow-auto max-h-32 mb-3">
          <p className="text-red-600 dark:text-red-400 text-sm font-mono">{error.message}</p>
        </div>
        
        {errorInfo && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md overflow-auto max-h-64">
              {error.stack}
              {'\n\n'}
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          <Home className="mr-2 h-4 w-4" />
          Go to homepage
        </Button>
        <Button onClick={handleResetAndNotify}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorFallback;
