
import { useToast } from '@/hooks/use-toast';

interface NotifyParams {
  title: string;
  message?: string;
  type?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

export const useNotify = () => {
  const { toast } = useToast();
  
  const notify = ({ title, message, type = 'default', duration = 3000 }: NotifyParams) => {
    // Convert our types to what the toast component accepts
    const variant: 'default' | 'destructive' = 
      type === 'error' ? 'destructive' : 'default';
    
    // For non-error variants, we'll use className to style instead
    let className: string | undefined;
    if (type === 'success') {
      className = 'border-green-600 bg-green-50 dark:bg-green-950/30';
    } else if (type === 'warning') {
      className = 'border-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
    }
    
    toast({
      title,
      description: message,
      variant,
      className,
      duration,
    });
  };
  
  return {
    notify,
    success: (title: string, message?: string) => notify({ title, message, type: 'success' }),
    error: (title: string, message?: string) => notify({ title, message, type: 'error' }),
    warning: (title: string, message?: string) => notify({ title, message, type: 'warning' }),
    info: (title: string, message?: string) => notify({ title, message })
  };
};
