
import React from "react";
import { ProgressCircle } from "./progress-circle";
import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RetryFeedbackProps {
  retryCount: number;
  maxRetries: number;
  isRetrying?: boolean;
  onRetry?: () => void;
  className?: string;
  successful?: boolean;
  showProgress?: boolean;
}

export function RetryFeedback({
  retryCount,
  maxRetries,
  isRetrying = false,
  onRetry,
  className,
  successful = false,
  showProgress = true
}: RetryFeedbackProps) {
  // Calculate progress percentage
  const progress = Math.min((retryCount / maxRetries) * 100, 100);
  
  // Determine status
  const isMaxedOut = retryCount >= maxRetries;
  const isComplete = successful || isMaxedOut;
  
  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-md text-sm",
      isMaxedOut ? "bg-destructive/10" : successful ? "bg-success/10" : "bg-muted",
      className
    )}>
      <div className="flex items-center gap-2">
        {successful ? (
          <CheckCircle className="h-4 w-4 text-success" />
        ) : isMaxedOut ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : isRetrying ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        
        <span>
          {successful ? (
            "Operation completed"
          ) : isMaxedOut ? (
            "Maximum retries reached"
          ) : isRetrying ? (
            `Retrying (${retryCount}/${maxRetries})...`
          ) : (
            `Retry ${retryCount} of ${maxRetries}`
          )}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {showProgress && !successful && (
          <ProgressCircle 
            value={progress} 
            size="sm"
            className={isMaxedOut ? "text-destructive" : ""}
          />
        )}
        
        {onRetry && !isRetrying && !successful && (
          <button
            onClick={onRetry}
            className="text-xs hover:underline"
            disabled={isComplete}
          >
            {isMaxedOut ? "Reset" : "Retry now"}
          </button>
        )}
      </div>
    </div>
  );
}

export default RetryFeedback;
