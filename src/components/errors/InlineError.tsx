
import React from 'react';
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export interface InlineErrorProps {
  message: string;
  details?: string;
  onRetry?: () => void;
  variant?: 'default' | 'subtle' | 'minimal';
  className?: string;
  severity?: 'error' | 'warning';
}

/**
 * InlineError - A component for displaying inline errors with optional retry functionality
 */
const InlineError: React.FC<InlineErrorProps> = ({
  message,
  details,
  onRetry,
  variant = 'default',
  className = '',
  severity = 'error'
}) => {
  const Icon = severity === 'error' ? AlertCircle : AlertTriangle;
  const iconColor = severity === 'error' ? 'text-destructive' : 'text-amber-500';
  
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-start gap-2 text-sm", className)}>
        <Icon className={cn("h-4 w-4 mt-0.5", iconColor)} />
        <div>
          <span className="font-medium">{message}</span>
          {details && <p className="text-xs text-muted-foreground mt-1">{details}</p>}
          {onRetry && (
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs flex items-center mt-1" 
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'subtle') {
    return (
      <div className={cn("flex items-start gap-2 p-3 bg-destructive/10 rounded border border-destructive/20", className)}>
        <Icon className={cn("h-4 w-4 mt-0.5", iconColor)} />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {details && <p className="text-sm text-muted-foreground mt-1">{details}</p>}
          {onRetry && (
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-2" /> Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Alert variant="destructive" className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-1" />
        <div className="flex-1">
          <AlertDescription>
            <p className="font-medium">{message}</p>
            {details && (
              <p className="text-sm mt-1 opacity-90">{details}</p>
            )}
            {onRetry && (
              <div className="mt-2">
                <Button size="sm" variant="secondary" className="bg-background hover:bg-background/90" onClick={onRetry}>
                  <RefreshCw className="h-3 w-3 mr-2" /> Try again
                </Button>
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default InlineError;
