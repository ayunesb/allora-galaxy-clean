
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface OnboardingErrorDialogProps {
  error: string | null;
  onClose: () => void;
}

const OnboardingErrorDialog: React.FC<OnboardingErrorDialogProps> = ({
  error,
  onClose
}) => {
  if (!error) return null;

  return (
    <AlertDialog open={!!error} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Error During Onboarding</AlertDialogTitle>
          <AlertDialogDescription>
            {error}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="default" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OnboardingErrorDialog;
