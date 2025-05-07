
import React from 'react';
import { AlertTriangle, RefreshCw, Mail, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { syncLocalEventsToSupabase } from '@/lib/system/logSystemEvent';
import { useToast } from '@/hooks/use-toast';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  supportEmail?: string;
  tenant_id?: string;
  showDetails?: boolean;
}

/**
 * A reusable error fallback component that provides consistent error presentation
 * Use with ErrorBoundary for component-level error handling
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = "Something went wrong",
  supportEmail = "support@example.com",
  tenant_id = "system",
  showDetails = false
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

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
    ).catch(logError => {
      console.error("Failed to log error to system logs:", logError);
    });
  }, [error, tenant_id]);

  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleSyncLogs = async () => {
    setIsSyncing(true);
    try {
      await syncLocalEventsToSupabase();
      toast({
        title: "Logs Synchronized",
        description: "System logs have been synchronized with the server"
      });
    } catch (syncError) {
      toast({
        title: "Log Sync Failed",
        description: String(syncError),
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
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

          {(showDetails || isExpanded) && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Technical Details</h3>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                {error.stack || 'No stack trace available.'}
              </pre>

              <div className="mt-4 flex flex-col gap-2">
                <h3 className="text-sm font-medium">Recovery Options</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 w-full justify-start"
                  onClick={handleSyncLogs}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing logs...' : 'Sync system logs'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={handleReload} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <a href={`mailto:${supportEmail}?subject=Error Report&body=${encodeURIComponent(`Error: ${error.message}\nStack: ${error.stack || 'Not available'}\nTime: ${new Date().toISOString()}`)}`}>
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={toggleDetails}
          >
            <Bug className="h-4 w-4 mr-2" />
            {isExpanded ? 'Hide details' : 'Show details'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorFallback;
