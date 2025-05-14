
import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
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
  const [isLoading, setIsLoading] = useState(true); // Changed from loading to isLoading
  const [error, setError] = useState<Error | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Fetch notifications from database
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await fetchUserNotifications(user.id);
      
      if (error) throw error;
      
      // Ensure all required properties are set when updating state
      const processedData = (data || []).map(notification => ({
        ...notification,
        is_read: !!notification.read_at
      }));
      
      setNotifications(processedData);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError(error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
          prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString(), is_read: true } : n)
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
        const now = new Date().toISOString();
        setNotifications(prev => 
          prev.map(n => ({ ...n, read_at: now, is_read: true }))
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
      isLoading, // Changed from loading to isLoading
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
