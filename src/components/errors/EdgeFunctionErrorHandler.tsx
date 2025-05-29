import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export interface EdgeFunctionErrorProps {
  error: Error;
  onRetry?: () => void;
  retry?: () => void; // Compatibility with old API
  showDetails?: boolean;
  showRequestId?: boolean; // Added for test compatibility
}

export const EdgeFunctionError: React.FC<EdgeFunctionErrorProps> = ({
  error,
  onRetry,
  retry, // Compatibility with old API
  showDetails = false,
  showRequestId = false,
}) => {
  const retryHandler = onRetry || retry; // Use onRetry if available, fall back to retry

  // Extract error details
  const errorObj = error as any;
  const requestId = errorObj.requestId || errorObj.request_id;
  const status = errorObj.status || errorObj.statusCode;
  const details = errorObj.details || {};

  return (
    <Card className="border-destructive/50 bg-destructive/5 mx-auto my-4 max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <AlertCircle className="mr-2 h-5 w-5" />
          Edge Function Error
          {status && <span className="ml-2 text-sm">({status})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="font-medium">{error.message}</p>

        {showRequestId && requestId && (
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold">Request ID:</span> {requestId}
          </div>
        )}

        {showDetails && Object.keys(details).length > 0 && (
          <div className="mt-2">
            <p className="font-semibold text-xs mb-1">Error Details:</p>
            <div className="rounded bg-muted/50 p-2 text-xs font-mono overflow-auto max-h-32">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>

      {retryHandler && (
        <CardFooter>
          <Button variant="outline" size="sm" onClick={retryHandler}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

// Alias export for backward compatibility
export const EdgeFunctionErrorDisplay = EdgeFunctionError;

// Re-export for convenience
export const EdgeFunctionHandler = EdgeFunctionError;

// Default export
export default EdgeFunctionError;
