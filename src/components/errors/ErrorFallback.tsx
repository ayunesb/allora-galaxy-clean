
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from '@/lib/notifications/toast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  title?: string;
  description?: string;
  showToast?: boolean;
  showLog?: boolean;
  hideResetButton?: boolean;
  customMessage?: string;
  logLevel?: 'info' | 'warning' | 'error';
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  description = 'An unexpected error occurred in this component.',
  showToast = true,
  showLog = true,
  hideResetButton = false,
  customMessage,
  logLevel = 'error'
}) => {
  useEffect(() => {
    // Log to system logs
    if (showLog) {
      logSystemEvent(
        'ui', 
        logLevel, 
        {
          error_type: error.name,
          error_message: error.message,
          stack: error.stack,
          description: customMessage || 'UI component error caught by ErrorBoundary'
        }
      ).catch(console.error);
    }

    // Show toast notification
    if (showToast) {
      toast.error({
        title,
        description: customMessage || error.message
      });
    }
  }, [error, showToast, showLog, customMessage, title, logLevel]);

  return (
    <Card className="w-full shadow-lg border-red-200 bg-red-50/50">
      <CardHeader className="bg-red-100/50 border-b border-red-200">
        <CardTitle className="text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-red-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="bg-white/80 rounded p-3 border border-red-200 font-mono text-sm overflow-auto max-h-40">
          <p className="font-semibold">{error.name}: {error.message}</p>
          {error.stack && (
            <pre className="text-xs mt-2 text-gray-700 whitespace-pre-wrap">
              {error.stack.split('\n').slice(1).join('\n')}
            </pre>
          )}
        </div>
      </CardContent>
      {!hideResetButton && (
        <CardFooter className="justify-end border-t border-red-200 bg-red-50/30">
          <Button 
            variant="outline" 
            onClick={resetErrorBoundary}
            className="hover:bg-red-100 border-red-200"
          >
            Try again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorFallback;
