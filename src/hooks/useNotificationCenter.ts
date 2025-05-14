
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { standardToast } from '@/lib/notifications/standardToast';
import { useTenantId } from '@/hooks/useTenantId';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  created_at: string;
  read_at: string | null;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

export interface NotificationCenterOptions {
  autoLoad?: boolean;
  autoSubscribe?: boolean;
  limit?: number;
  showToastOnNew?: boolean;
}

export function useNotificationCenter(options: NotificationCenterOptions = {}) {
  const {
    autoLoad = true,
    autoSubscribe = true,
    limit = 50,
    showToastOnNew = true
  } = options;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const tenantId = useTenantId();
  
  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (fetchError) throw new Error(fetchError.message);
      
      // Calculate is_read property for each notification
      const processedNotifications = (data || []).map(notification => ({
        ...notification,
        is_read: notification.read_at !== null
      }));
      
      setNotifications(processedNotifications);
      
      // Update unread count
      const unread = processedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, [tenantId, limit]);
  
  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const timestamp = new Date().toISOString();
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notification =>
          notification.id === id && !notification.is_read
            ? { ...notification, is_read: true, read_at: timestamp }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update in database with retry logic
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: timestamp })
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      
      // Revert the optimistic update
      await loadNotifications();
      
      return { success: false, error: err };
    }
  }, [loadNotifications]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!tenantId) return { success: false };
    
    try {
      const timestamp = new Date().toISOString();
      
      // Optimistically update UI
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
        .eq('tenant_id', tenantId)
        .is('read_at', null);
      
      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      
      // Revert the optimistic update
      await loadNotifications();
      
      return { success: false, error: err };
    }
  }, [tenantId, loadNotifications]);
  
  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      // Optimistically update UI
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Update unread count if needed
      const wasUnread = notifications.find(n => n.id === id && !n.is_read);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Delete from database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting notification:', err);
      
      // Revert the optimistic update
      await loadNotifications();
      
      return { success: false, error: err };
    }
  }, [notifications, loadNotifications]);
  
  // Listen for new notifications using real-time subscription
  useEffect(() => {
    if (!tenantId || !autoSubscribe) return;
    
    // Set up real-time subscription
    const channel = supabase
      .channel('notification_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `tenant_id=eq.${tenantId}`
      }, (payload) => {
        // Add the new notification to the list
        const newNotification = {
          ...payload.new as Notification,
          is_read: false
        };
        
        // Add to state
        setNotifications(prev => [newNotification, ...prev]);
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Show toast if enabled
        if (showToastOnNew) {
          const notificationType = newNotification.type || 'info';
          
          // Map notification type to toast function
          switch (notificationType) {
            case 'success':
              standardToast.success(newNotification.title, newNotification.message);
              break;
            case 'error':
              standardToast.error(newNotification.title, newNotification.message);
              break;
            case 'warning':
              standardToast.warning(newNotification.title, newNotification.message);
              break;
            default:
              standardToast.info(newNotification.title, newNotification.message);
          }
        }
      })
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, autoSubscribe, showToastOnNew]);
  
  // Initial load
  useEffect(() => {
    if (autoLoad && tenantId) {
      loadNotifications();
    }
  }, [autoLoad, tenantId, loadNotifications]);
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
