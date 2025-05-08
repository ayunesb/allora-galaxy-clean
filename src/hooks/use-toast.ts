
// Re-export the original toast functionality from the shadcn package
import { useToast as useShadcnToast, toast as shadcnToast } from "@/components/ui/toast";
import { ToastActionElement } from "@/components/ui/toast";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { useCallback } from "react";

export const useToast = useShadcnToast;

// Override the toast function to optionally persist to notifications
export const toast = (props: {
  title: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  persist?: boolean; // If true, also save to notifications system
}) => {
  // Always show the UI toast
  shadcnToast(props);

  // If persist is true, save to supabase
  if (props.persist) {
    const notificationType = props.variant || "info";
    const tenant_id = localStorage.getItem('currentTenantId');
    
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id && tenant_id) {
        supabase.from('notifications').insert({
          id: uuidv4(),
          title: props.title,
          message: props.description || '',
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
        return false;
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
        return false;
      }
      
      // Also show as a toast
      shadcnToast({
        title: params.title,
        description: params.description,
        variant: (params.type === 'error' ? 'destructive' : 
                 (params.type === 'success' ? 'success' : 
                 (params.type === 'warning' ? 'warning' : 'default'))) as any
      });
      
      // Refresh notifications
      await refreshNotifications();
      
      return true;
    } catch (err) {
      console.error('Failed to send notification:', err);
      return false;
    }
  }, [tenantId, refreshNotifications]);
  
  return { notify };
};
