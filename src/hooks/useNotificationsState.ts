
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/context/notifications/types';
import { 
  fetchUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteUserNotification, 
  getUnreadNotificationCount 
} from '@/context/notifications/notificationUtils';
import { supabase } from '@/lib/supabase';

export const useNotificationsState = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshNotifications = useCallback(async () => {
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
  }, [userId]);

  const markAsRead = useCallback(async (id: string) => {
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
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
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
  }, [userId]);

  const deleteNotification = useCallback(async (id: string) => {
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
  }, [userId, notifications]);

  // Load notifications on mount and when userId changes
  useEffect(() => {
    if (userId) {
      refreshNotifications();
    }
  }, [userId, refreshNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setNotifications,
    setUnreadCount
  };
};
