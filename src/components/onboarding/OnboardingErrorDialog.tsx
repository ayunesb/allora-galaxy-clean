import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { notifyError } from "@/hooks/use-toast";

interface OnboardingErrorDialogProps {
  error: string | null;
  onClose: () => void;
  onRetry?: () => Promise<void>;
  tenant_id?: string;
}

/**
 * Enhanced error dialog component with retry functionality and error logging
 */
const OnboardingErrorDialog: React.FC<OnboardingErrorDialogProps> = ({
  error,
  onClose,
  onRetry,
  tenant_id = "system",
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  if (!error) return null;

  // Log the error when dialog is shown
  React.useEffect(() => {
    if (error) {
      logSystemEvent(
        "system",
        "error",
        {
          description: `Onboarding error: ${error}`,
          error: error,
          context: "onboarding",
        },
        tenant_id,
      ).catch((err) => console.error("Failed to log onboarding error:", err));
    }
  }, [error, tenant_id]);

  const handleRetry = async () => {
    if (!onRetry) {
      window.location.reload();
      return;
    }

    try {
      setIsRetrying(true);
      await onRetry();
      setIsRetrying(false);
      onClose();
    } catch (retryError: any) {
      setIsRetrying(false);
      logSystemEvent(
        "system",
        "error",
        {
          description: `Retry failed: ${retryError.message || "Unknown retry error"}`,
          error: retryError.message || "Unknown retry error",
          original_error: error,
          context: "onboarding_retry",
        },
        tenant_id,
      ).catch((err) => console.error("Failed to log retry error:", err));

      notifyError(
        `Retry failed: ${retryError.message || "Unable to retry operation"}`,
      );
    }
  };

  return (
    <AlertDialog open={!!error} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
          <AlertDialogTitle>Error</AlertDialogTitle>
          <AlertDialogDescription>{error}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
          {onRetry && (
            <Button
              variant="destructive"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OnboardingErrorDialog;
