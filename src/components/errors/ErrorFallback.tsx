
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import { handleError } from '@/lib/errors/ErrorHandler';
import { ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifySuccess } from '@/components/ui/BetterToast';

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo | null;
  resetErrorBoundary: () => void;
  supportEmail?: string;
  tenantId?: string;
  showHeader?: boolean;
  showReport?: boolean;
  showHomeButton?: boolean;
  showRetry?: boolean;
  title?: string;
  description?: string;
  level?: 'page' | 'section' | 'component';
}

export function ErrorFallback({ 
  error, 
  errorInfo, 
  resetErrorBoundary, 
  supportEmail = 'support@allora.com',
  tenantId = 'system',
  showHeader = true,
  showReport = true,
  showHomeButton = false,
  showRetry = true,
  title = 'Something went wrong',
  description,
  level = 'component'
}: ErrorFallbackProps) {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = React.useState(false);
  
  // Default description based on the error level
  const defaultDescription = level === 'page' 
    ? 'We encountered a problem loading this page. You can try refreshing the browser or return to the dashboard.'
    : level === 'section'
      ? 'Part of the page failed to load correctly. You can try reloading the affected area.'
      : 'A component failed to render properly. You can try refreshing the page.';
  
  // Use custom description or fall back to default
  const errorDescription = description || defaultDescription;
  
  // Log error once on mount
  useEffect(() => {
    handleError(error, {
      context: {
        componentStack: errorInfo?.componentStack,
        errorFallback: true,
        errorLevel: level
      },
      tenantId,
      showNotification: false, // Don't show notification, we're already showing the UI
    });
  }, [error, errorInfo, tenantId, level]);

  const handleReportError = () => {
    // Log a report event
    handleError(error, {
      context: {
        reportedByUser: true,
        componentStack: errorInfo?.componentStack,
      },
      tenantId,
      showNotification: false,
    });
    
    notifySuccess(
      "Error report sent", 
      `Thank you for reporting this issue. Our team will investigate. You may also contact us at ${supportEmail}.`
    );
  };
  
  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Add a small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      resetErrorBoundary();
    } finally {
      setIsRetrying(false);
    }
  };
  
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={`p-6 ${level === 'page' ? 'max-w-2xl mx-auto mt-10' : 'w-full'}`}>
      {showHeader && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{errorDescription}</AlertDescription>
        </Alert>
      )}

      {/* Error details for debugging - collapsible */}
      <details className="bg-muted p-4 rounded-md mb-6 text-sm">
        <summary className="font-medium cursor-pointer">Error details</summary>
        <div className="mt-2 overflow-auto max-h-60">
          <p className="font-mono text-sm">{error.message}</p>
          {errorInfo && (
            <pre className="text-xs mt-4 text-muted-foreground overflow-x-auto">
              {errorInfo.componentStack}
            </pre>
          )}
        </div>
      </details>

      <div className="flex gap-4 flex-wrap">
        {showRetry && (
          <Button onClick={handleRetry} variant="default" disabled={isRetrying}>
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
        )}
        
        {showHomeButton && (
          <Button onClick={handleGoHome} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        )}
        
        {showReport && (
          <Button onClick={handleReportError} variant="outline">
            Report Issue
          </Button>
        )}
      </div>
    </div>
  );
}

export default ErrorFallback;
