import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { useTenantId } from '@/hooks/useTenantId';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const tenantId = useTenantId();

  const refreshNotifications = useCallback(async () => {
    if (!tenantId) {
      setIsLoading(false);
      return { success: true };
    }
    
    try {
      setIsLoading(true);
      
      // Fetch notifications for the current tenant and user
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setNotifications(data || []);
      return { success: true };
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);
  
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { success: false, error: err as Error };
    }
  }, []);
  
  const markAllAsRead = useCallback(async () => {
    if (!tenantId) return { success: true };
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .is('is_read', false);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return { success: false, error: err as Error };
    }
  }, [tenantId]);
  
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting notification:', err);
      return { success: false, error: err as Error };
    }
  }, []);
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.is_read).length;
  
  // Load notifications on mount and when tenant changes
  useEffect(() => {
    if (tenantId) {
      refreshNotifications();
    }
  }, [tenantId, refreshNotifications]);
  
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
};
