
import { toast } from '@/hooks/use-toast';

// Simple toast helper functions for consistent notification styling
export const notifySuccess = (message: string, title?: string) => {
  return toast({
    title: title || 'Success',
    description: message,
    variant: 'default',
  });
};

export const notifyError = (message: string, title?: string) => {
  return toast({
    title: title || 'Error',
    description: message,
    variant: 'destructive',
  });
};

export const notifyWarning = (message: string, title?: string) => {
  return toast({
    title: title || 'Warning',
    description: message,
    variant: 'default', // Using default with custom styling if needed
  });
};

export const notifyInfo = (message: string, title?: string) => {
  return toast({
    title: title || 'Information',
    description: message,
    variant: 'default',
  });
};
