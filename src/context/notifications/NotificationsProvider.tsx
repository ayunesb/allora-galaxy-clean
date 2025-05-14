
import React, { createContext, useState, useEffect } from 'react';
import { 
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  getUnreadNotificationCount 
} from '@/context/notifications/notificationUtils';
import { Notification } from './types';
import { supabase } from '@/lib/supabase';
import { NotificationsContextValue } from './types';

export const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refreshNotifications: async () => {},
  error: null
});

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID on mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUserId();
  }, []);

  // Fetch notifications when userId changes
  useEffect(() => {
    if (userId) {
      refreshNotifications();
      setupRealtimeSubscription();
    }
  }, [userId]);

  const setupRealtimeSubscription = () => {
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
        handleNewNotification)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleNewNotification = async (payload: any) => {
    // Add new notification to the state and update unread count
    const newNotification: Notification = payload.new;
    
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.read_at) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const refreshNotifications = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await fetchUserNotifications(userId);
      
      if (error) throw error;
      
      if (data) {
        // Convert read_at to is_read boolean to simplify usage
        const notificationsWithReadFlag = data.map(notification => ({
          ...notification,
          is_read: !!notification.read_at
        }));
        
        setNotifications(notificationsWithReadFlag);
      }
      
      // Update unread count
      const { count, error: countError } = await getUnreadNotificationCount(userId);
      if (!countError) {
        setUnreadCount(count);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to fetch notifications'));
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!userId) return;
    
    try {
      const { success, error } = await markNotificationAsRead(id, userId);
      
      if (error) throw error;
      
      if (success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id
              ? { ...notification, read_at: new Date().toISOString(), is_read: true }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to mark notification as read'));
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const { success, error } = await markAllNotificationsAsRead(userId);
      
      if (error) throw error;
      
      if (success) {
        const timestamp = new Date().toISOString();
        setNotifications(prev => 
          prev.map(notification => ({ 
            ...notification, 
            read_at: notification.read_at || timestamp,
            is_read: true 
          }))
        );
        
        // Reset unread count
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to mark all notifications as read'));
    }
  };

  const deleteNotification = async (id: string) => {
    if (!userId) return;
    
    try {
      const { success, error } = await deleteUserNotification(id, userId);
      
      if (error) throw error;
      
      if (success) {
        const deletedNotification = notifications.find(n => n.id === id);
        
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        
        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.read_at) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to delete notification'));
    }
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications,
      error
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
