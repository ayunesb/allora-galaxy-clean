
import { toast } from '@/lib/toast';

export { toast };

export const standardToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, options);
  },
  error: (message: string, options?: any) => {
    return toast.error(message, options);
  },
  info: (message: string, options?: any) => {
    return toast.info(message, options);
  },
  warning: (message: string, options?: any) => {
    return toast.warning(message, options);
  }
};
