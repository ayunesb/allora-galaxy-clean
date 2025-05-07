
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
    const variant = type === 'default' ? 'default' : 
                   type === 'success' ? 'success' : 
                   type === 'error' ? 'destructive' : 
                   'default';
    
    toast({
      title,
      description: message,
      variant,
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
