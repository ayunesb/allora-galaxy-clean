
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notifyError, notifySuccess } from '@/components/ui/BetterToast';
import { BaseNotification } from '@/types/notifications';

export interface UseNotificationsOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  showToasts?: boolean;
  showToastOnNew?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const {
    autoLoad = false,
    refreshInterval = 0,
    showToasts = false,
    showToastOnNew = false
  } = options;

  const [notifications, setNotifications] = useState<BaseNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  // Fetch notifications from the database
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch notifications for this user
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      
      // Calculate unread count
      const unread = (data || []).filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
      setLastFetchTime(new Date());
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to fetch notifications:', error);
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to mark notification as read:', error);
      if (showToasts) {
        notifyError('Failed to mark notification as read');
      }
      return { success: false, error };
    }
  }, [showToasts]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      if (showToasts) {
        notifySuccess('All notifications marked as read');
      }
      
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to mark all notifications as read:', error);
      if (showToasts) {
        notifyError('Failed to mark all notifications as read');
      }
      return { success: false, error };
    }
  }, [showToasts]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Update unread count if needed
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to delete notification:', error);
      if (showToasts) {
        notifyError('Failed to delete notification');
      }
      return { success: false, error };
    }
  }, [notifications, showToasts]);

  // Initial fetch on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      fetchNotifications();
    }
  }, [autoLoad, fetchNotifications]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, refreshInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchNotifications]);

  // Check for new notifications to show toast
  useEffect(() => {
    if (showToastOnNew && lastFetchTime && notifications.length > 0) {
      // Find notifications created after last fetch time that are unread
      const lastFetch = lastFetchTime.getTime();
      const newNotifications = notifications.filter(n => {
        const createdAt = new Date(n.created_at).getTime();
        return !n.is_read && createdAt > lastFetch;
      });
      
      if (newNotifications.length > 0) {
        notifyInfo(`You have ${newNotifications.length} new notification${newNotifications.length > 1 ? 's' : ''}`);
      }
    }
  }, [notifications, showToastOnNew, lastFetchTime]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

export default useNotifications;
