
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from './types';

interface UseRealtimeNotificationsProps {
  userId: string | null;
  onNewNotification: (notification: Notification) => void;
}

export const useRealtimeNotifications = ({
  userId,
  onNewNotification
}: UseRealtimeNotificationsProps) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          // Handle the new notification
          const newNotification: Notification = payload.new as Notification;
          onNewNotification(newNotification);
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNewNotification]);
};
