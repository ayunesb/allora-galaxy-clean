
import { useCallback, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import { useNotificationsContext } from '@/context/NotificationsContext';

// Define the toast types
export interface Toast {
  id: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
  duration?: number;
}

export type ToastActionElement = React.ReactNode;

// Create a custom hook for toast
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (props: Omit<Toast, "id">) => {
      const id = uuidv4();
      const newToast = { id, ...props };
      setToasts((prevToasts) => [...prevToasts, newToast]);
      return id;
    },
    [setToasts]
  );

  const dismiss = useCallback((toastId?: string) => {
    setToasts((prevToasts) => prevToasts.filter(({ id }) => id !== toastId));
  }, [setToasts]);

  return {
    toast,
    dismiss,
    toasts,
  };
};

// Export a standalone toast function to optionally persist to notifications
export const toast = (props: {
  title: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  className?: string;
  duration?: number;
  persist?: boolean; // If true, also save to notifications system
}) => {
  // For standalone usage, create a temporary toast and use it
  const id = uuidv4();
  const toastInstance = document.createEvent('CustomEvent');
  toastInstance.initCustomEvent('toast', true, true, { id, ...props });
  document.dispatchEvent(toastInstance);

  // If persist is true, save to supabase
  if (props.persist) {
    const notificationType = props.variant === "destructive" ? "error" : "info";
    const tenant_id = localStorage.getItem('currentTenantId');
    
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id && tenant_id) {
        supabase.from('notifications').insert({
          id: uuidv4(),
          title: props.title,
          description: props.description || '',
          tenant_id,
          user_id: data.user.id,
          type: notificationType,
          created_at: new Date().toISOString()
        }).then(({ error }) => {
          if (error) {
            console.error('Error persisting notification:', error);
          }
        });
      }
    });
  }
};

// Hook for sending notifications that are persisted
export const useNotify = () => {
  const tenantId = useTenantId();
  const { refreshNotifications } = useNotificationsContext();
  
  const notify = useCallback(async (params: {
    title: string;
    description?: string;
    type?: "info" | "success" | "warning" | "error" | "system" | "milestone";
    action_url?: string;
    action_label?: string;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId || !tenantId) {
        console.error('Cannot send notification: Missing user ID or tenant ID');
        return { success: false, error: new Error('Missing user ID or tenant ID') };
      }
      
      const { error } = await supabase.from('notifications').insert({
        title: params.title,
        description: params.description,
        tenant_id: tenantId,
        user_id: userId,
        type: params.type || 'info',
        action_url: params.action_url,
        action_label: params.action_label,
        created_at: new Date().toISOString()
      });
      
      if (error) {
        console.error('Error sending notification:', error);
        return { success: false, error };
      }
      
      // Also show as a toast
      const variant = params.type === 'error' ? 'destructive' : 'default';
      const className = getClassNameByType(params.type);
      
      toast({
        title: params.title,
        description: params.description,
        variant,
        className
      });
      
      // Refresh notifications
      await refreshNotifications();
      
      return { success: true };
    } catch (err) {
      console.error('Failed to send notification:', err);
      return { success: false, error: err as Error };
    }
  }, [tenantId, refreshNotifications]);
  
  return { notify };
};

// Helper function to get class names based on notification type
function getClassNameByType(type?: string): string | undefined {
  switch (type) {
    case 'success':
      return 'border-green-600 bg-green-50 dark:bg-green-950/30';
    case 'warning':
      return 'border-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
    case 'error':
      return ''; // Using destructive variant instead
    default:
      return undefined;
  }
}
