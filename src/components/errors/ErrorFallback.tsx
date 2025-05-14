
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ErrorFallbackProps {
  error: Error;
  reset?: () => void;
  resetErrorBoundary?: () => void;
  supportEmail?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, reset, resetErrorBoundary, supportEmail }) => {
  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else if (reset) {
      reset();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
      <p className="text-destructive mb-4">{error.message || 'An unexpected error occurred.'}</p>
      
      {supportEmail && (
        <p className="text-sm text-muted-foreground mb-4">
          Contact <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a> for support.
        </p>
      )}
      
      <div className="space-x-4">
        <Button onClick={() => {
          toast.error("Error reported", {
            description: "Thank you for reporting this error. Our team has been notified."
          });
        }}>
          Report Error
        </Button>
        <Button variant="outline" onClick={() => {
          window.location.reload();
        }}>
          Try Again
        </Button>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="mt-4">
            Reset App State
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will reset the entire application state.
              All unsaved data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              handleReset();
              window.location.reload();
            }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ErrorFallback;
