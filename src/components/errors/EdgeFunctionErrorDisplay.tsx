import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface EdgeFunctionErrorProps {
  error: Error | { message: string; status?: number; details?: any } | null;
  onRetry?: () => void;
}

export const EdgeFunctionErrorDisplay: React.FC<EdgeFunctionErrorProps> = ({
  error,
  onRetry,
}) => {
  if (!error) return null;

  const errorMessage =
    typeof error === "object" && error !== null ? error.message : String(error);
  const errorStatus =
    typeof error === "object" && error !== null && "status" in error
      ? error.status
      : undefined;
  const errorDetails =
    typeof error === "object" && error !== null && "details" in error
      ? error.details
      : undefined;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        Edge Function Error {errorStatus && `(${errorStatus})`}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{errorMessage}</p>
        {errorDetails && (
          <ScrollArea className="h-[200px] rounded-md border p-4 bg-background/50 mt-2">
            <pre className="text-xs">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </ScrollArea>
        )}
        {onRetry && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default EdgeFunctionErrorDisplay;
