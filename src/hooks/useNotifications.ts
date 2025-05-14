
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeNotifications } from './useRealtimeNotifications';
import { toast } from '@/lib/toast';

export interface UseNotificationsOptions {
  limit?: number;
  autoLoad?: boolean;
  showToasts?: boolean;
}

export function useNotifications({
  limit = 50,
  autoLoad = true,
  showToasts = false
}: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Handle real-time notifications
  const handleNewNotification = useCallback((newNotification: Notification) => {
    setNotifications(prev => [{ 
      ...newNotification, 
      is_read: false 
    }, ...prev]);
    
    setUnreadCount(prev => prev + 1);
  }, []);

  // Set up real-time subscription with our hook
  useRealtimeNotifications({ 
    showToast: showToasts,
    onNewNotification: handleNewNotification
  });

  // Load notifications
  const refreshNotifications = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (fetchError) throw new Error(fetchError.message);
      
      const processedNotifications = (data || []).map(notification => ({
        ...notification,
        is_read: !!notification.read_at
      }));
      
      setNotifications(processedNotifications);
      setUnreadCount(processedNotifications.filter(n => !n.is_read).length);
      
      return { success: true };
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit]);

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return { success: false };
    
    try {
      const timestamp = new Date().toISOString();
      
      // Optimistic update
      setNotifications(prev => 
        prev.map(notification =>
          notification.id === id ? { 
            ...notification, 
            is_read: true, 
            read_at: timestamp 
          } : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update in database
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: timestamp })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      
      // Revert optimistic update
      await refreshNotifications();
      
      return { success: false, error: err };
    }
  }, [user?.id, refreshNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return { success: false };
    
    try {
      const timestamp = new Date().toISOString();
      
      // Optimistic update
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: timestamp
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      // Update in database
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: timestamp })
        .eq('user_id', user.id)
        .is('read_at', null);
      
      if (error) throw error;
      
      toast.success('All notifications marked as read');
      return { success: true };
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      
      // Revert optimistic update
      await refreshNotifications();
      
      return { success: false, error: err };
    }
  }, [user?.id, refreshNotifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!user?.id) return { success: false };
    
    try {
      // Optimistic update
      const notificationToDelete = notifications.find(n => n.id === id);
      const wasUnread = notificationToDelete && !notificationToDelete.is_read;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Delete from database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting notification:', err);
      
      // Revert optimistic update
      await refreshNotifications();
      
      return { success: false, error: err };
    }
  }, [notifications, user?.id, refreshNotifications]);

  // Load notifications on mount
  useEffect(() => {
    if (autoLoad && user?.id) {
      refreshNotifications();
    }
  }, [autoLoad, user?.id, refreshNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };
}
