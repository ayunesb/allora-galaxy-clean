
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types/notifications';

/**
 * A hook for setting up realtime notifications using Supabase
 * 
 * @param onNotification Callback to be called when a notification is received
 * @returns An object with the cleanup function
 */
export function useRealtimeNotifications(onNotification: (payload: Notification) => void) {
  const { user } = useAuth();

  const setupRealtimeSubscription = useCallback(() => {
    if (!user?.id) return null;

    // Create a channel for the notifications table
    const notificationChannel = supabase.channel('notification_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload: { new: Notification }) => {
          // Call the callback with the payload
          onNotification(payload.new);
        }
      )
      .subscribe();

    // Return a cleanup function
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [user?.id, onNotification]);

  // Set up the subscription when the component mounts and clean up when it unmounts
  useEffect(() => {
    const cleanupFn = setupRealtimeSubscription();
    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [setupRealtimeSubscription]);

  return {
    forceReconnect: setupRealtimeSubscription
  };
}

export default useRealtimeNotifications;
