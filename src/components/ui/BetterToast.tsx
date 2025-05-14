
import { toast } from './use-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const notifySuccess = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'default',
    duration: 3000,
  });
};

export const notifyError = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'destructive',
    duration: 5000,
  });
};

export const notifyInfo = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'default',
    duration: 4000,
  });
};

export default {
  notifySuccess,
  notifyError,
  notifyInfo,
};
