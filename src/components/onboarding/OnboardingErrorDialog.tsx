
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { notifyError } from '@/components/ui/BetterToast';

interface OnboardingErrorDialogProps {
  error: string;
  onClose: () => void;
  onRetry: () => void;
}

export const OnboardingErrorDialog: React.FC<OnboardingErrorDialogProps> = ({
  error,
  onClose,
  onRetry
}) => {
  // Show notification error
  React.useEffect(() => {
    if (error) {
      notifyError('Error during onboarding process');
    }
  }, [error]);

  return (
    <AlertDialog open={!!error}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Onboarding Error</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {error}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRetry}>Retry</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OnboardingErrorDialog;
