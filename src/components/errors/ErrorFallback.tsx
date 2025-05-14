
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTenantId } from '@/hooks/useTenantId';
import { AlertOctagon } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  onError?: (error: Error, tenantId: string | null) => void;
}

export function ErrorFallback({ error, resetErrorBoundary, onError }: ErrorFallbackProps) {
  const tenantId = useTenantId();
  
  // Log error to console
  React.useEffect(() => {
    console.error('ErrorBoundary caught an error:', error);
    
    // Optional callback for additional error processing
    if (onError) {
      onError(error, tenantId);
    }
    
    // Show toast notification
    toast.error('An error occurred', {
      description: 'The application encountered an unexpected problem.'
    });
  }, [error, onError, tenantId]);

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
      <AlertOctagon className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        The application encountered an unexpected error. Our team has been notified.
      </p>
      <div className="space-x-2">
        <Button variant="outline" onClick={resetErrorBoundary}>
          Try again
        </Button>
        <Button onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
      
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 p-3 bg-muted rounded-md text-left max-w-md overflow-auto">
          <p className="text-xs font-semibold mb-2">Error details:</p>
          <pre className="text-xs whitespace-pre-wrap break-words">
            {error.message}
            {error.stack && (
              <div className="mt-2 text-xs opacity-70">{error.stack}</div>
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
