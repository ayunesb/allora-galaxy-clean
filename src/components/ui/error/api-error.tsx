
import { AlertTriangle } from 'lucide-react';
import { toast } from '@/lib/toast';

export interface APIErrorOptions {
  /** Whether to show a toast notification */
  showToast?: boolean;
  /** Error title */
  title?: string;
  /** Additional details */
  details?: Record<string, any>;
  /** Duration for toast notification */
  duration?: number;
}

/**
 * Standard API error handler
 */
export function handleAPIError(
  error: any, 
  { 
    showToast = true, 
    title = "API Error", 
    details = {},
    duration = 8000
  }: APIErrorOptions = {}
) {
  // Extract error message
  const message = error?.message || error?.error || "An unexpected error occurred";
  
  // Log error to console
  console.error("API Error:", message, error, details);
  
  // Show toast notification if enabled
  if (showToast) {
    toast.error(message, {
      id: String(Date.now()),
      title,
      duration,
    });
  }
  
  // Return standardized error object
  return {
    message,
    error,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * API Error display component
 */
export function APIError({ 
  error,
  className,
  onRetry
}: { 
  error: any;
  className?: string;
  onRetry?: () => void;
}) {
  const message = error?.message || error?.error || "An unexpected error occurred";
  
  return (
    <div className={`border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 rounded p-3 ${className}`}>
      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
        <AlertTriangle size={16} />
        <span className="font-medium">API Error</span>
      </div>
      <p className="mt-1 text-sm text-red-600 dark:text-red-300">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 text-xs font-medium text-red-700 dark:text-red-400 hover:underline"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
