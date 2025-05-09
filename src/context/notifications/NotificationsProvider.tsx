
import React, { useState, useEffect, ReactNode } from 'react';
import useAuth from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NotificationsContext from './NotificationsContext';
import { Notification } from './types';
import { 
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification
} from './notificationUtils';

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Fetch notifications from database
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await fetchUserNotifications(user.id);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError(error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to notification updates
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { success, error } = await markNotificationAsRead(id, user.id);
      
      if (error) throw error;
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      setError(error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const { success, error } = await markAllNotificationsAsRead(user.id);
      
      if (error) throw error;
      if (success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
      }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      setError(error);
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string) => {
    if (!user) return;

    try {
      const { success, error } = await deleteUserNotification(id, user.id);
      
      if (error) throw error;
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      setError(error);
    }
  };

  // Manually refresh notifications
  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications,
      error,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
