
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types/notifications';
import { toast } from '@/lib/toast';

export interface UseRealtimeNotificationsOptions {
  showToast?: boolean;
  onNewNotification?: (notification: Notification) => void;
}

/**
 * Hook for setting up and managing real-time notifications
 */
export function useRealtimeNotifications({ 
  showToast = true,
  onNewNotification
}: UseRealtimeNotificationsOptions = {}) {
  const { user } = useAuth();
  
  // Handle new notifications from realtime subscription
  const handleNewNotification = useCallback((newNotification: Notification) => {
    // Call the provided callback if it exists
    if (onNewNotification) {
      onNewNotification(newNotification);
    }
    
    // Show toast notification if enabled
    if (showToast && newNotification) {
      const notificationType = newNotification.type || 'info';
      
      switch (notificationType) {
        case 'success':
          toast.success(newNotification.title, { 
            description: newNotification.message,
            id: newNotification.id,
            action: newNotification.action_label && newNotification.action_url ? {
              label: newNotification.action_label,
              onClick: () => window.open(newNotification.action_url, '_blank')
            } : undefined
          });
          break;
        case 'error':
          toast.error(newNotification.title, { 
            description: newNotification.message,
            id: newNotification.id,
            action: newNotification.action_label && newNotification.action_url ? {
              label: newNotification.action_label,
              onClick: () => window.open(newNotification.action_url, '_blank')
            } : undefined
          });
          break;
        case 'warning':
          toast.warning(newNotification.title, { 
            description: newNotification.message,
            id: newNotification.id,
            action: newNotification.action_label && newNotification.action_url ? {
              label: newNotification.action_label,
              onClick: () => window.open(newNotification.action_url, '_blank')
            } : undefined
          });
          break;
        default:
          toast.info(newNotification.title, { 
            description: newNotification.message,
            id: newNotification.id,
            action: newNotification.action_label && newNotification.action_url ? {
              label: newNotification.action_label,
              onClick: () => window.open(newNotification.action_url, '_blank')
            } : undefined
          });
      }
    }
  }, [showToast, onNewNotification]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase.channel('notification_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Process the new notification
          const newNotification = payload.new as Notification;
          handleNewNotification(newNotification);
        }
      )
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, handleNewNotification]);
  
  return {
    // Return empty object for now, could be extended later
  };
}

export default useRealtimeNotifications;
