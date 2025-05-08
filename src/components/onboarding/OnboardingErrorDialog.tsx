import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { notifyError } from '@/components/ui/BetterToast';

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
  tenant_id = 'system'
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  if (!error) return null;

  // Log the error when dialog is shown
  React.useEffect(() => {
    if (error) {
      logSystemEvent(
        tenant_id,
        'system',
        'onboarding_error',
        { error }
      ).catch(err => console.error('Failed to log onboarding error:', err));
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
      console.error('Retry failed:', retryError);
      
      // Log the retry failure
      logSystemEvent(
        tenant_id,
        'system',
        'onboarding_retry_failed',
        { original_error: error, retry_error: retryError.message }
      ).catch(err => console.error('Failed to log retry error:', err));
      
      notifyError(
        'Retry Failed',
        retryError.message || 'Failed to retry the operation. Please try again later.'
      );
    }
  };

  return (
    <AlertDialog open={!!error} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error During Onboarding
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {error}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="default" 
              onClick={handleRetry}
              disabled={isRetrying}
              className="gap-2"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry</span>
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OnboardingErrorDialog;
