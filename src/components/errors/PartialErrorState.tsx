
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface PartialErrorStateProps {
  title?: string;
  message: string;
  section?: string;
  onRetry?: () => void;
  variant?: 'banner' | 'inline' | 'embedded';
  className?: string;
  showRetryButton?: boolean;
}

/**
 * PartialErrorState - Used when only a portion of the UI has an error
 * but the main content can still be displayed
 */
const PartialErrorState: React.FC<PartialErrorStateProps> = ({
  title = 'Some data could not be loaded',
  message,
  section,
  onRetry,
  variant = 'banner',
  className = '',
  showRetryButton = true,
}) => {
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded", className)}>
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {section && <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{section}</p>}
          <p className="text-sm text-amber-700 dark:text-amber-400">{message}</p>
          
          {showRetryButton && onRetry && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onRetry} 
              className="mt-1 h-8 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Reload
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  if (variant === 'embedded') {
    return (
      <div className={cn("rounded border bg-background p-4", className)}>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </div>
          <p className="font-medium">{title}</p>
        </div>
        
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        
        {section && (
          <div className="mt-1 text-xs text-muted-foreground">
            Affected section: {section}
          </div>
        )}
        
        {showRetryButton && onRetry && (
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry loading
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Banner variant (default)
  return (
    <div className={cn("w-full bg-amber-50 dark:bg-amber-950/20 py-2 px-4", className)}>
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span className="text-sm text-amber-700 dark:text-amber-400">
              {title}{section ? ` (${section})` : ''}: {message}
            </span>
          </div>
          
          {showRetryButton && onRetry && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onRetry}
              className="bg-white dark:bg-background border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      </div>
      <Separator className="absolute bottom-0 left-0 right-0 border-amber-200 dark:border-amber-800" />
    </div>
  );
};

export default PartialErrorState;
