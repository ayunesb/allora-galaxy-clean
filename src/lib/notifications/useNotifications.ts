
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useAuth } from '@/context/AuthContext';
import { Notification, NotificationsContextType } from '@/types/notifications';
import { checkNetworkStatus } from '@/lib/supabase';

/**
 * Hook for managing notifications
 */
export function useNotifications(): NotificationsContextType {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const tenantId = useTenantId();
  const { user } = useAuth();
  
  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!tenantId || !user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return { success: false, error: new Error('No tenant or user ID available') };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch notifications: ${fetchError.message}`);
      }

      const typedData = data as Notification[];
      setNotifications(typedData);
      setUnreadCount(typedData.filter(n => !n.is_read).length);
      
      return { success: true };
    } catch (err: any) {
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [tenantId, user?.id]);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user?.id || '');

      if (updateError) {
        throw new Error(`Failed to mark notification as read: ${updateError.message}`);
      }

      // Update local state to avoid refetch
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!tenantId || !user?.id) {
      return { success: false, error: new Error('No tenant or user ID available') };
    }

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(`Failed to mark all notifications as read: ${updateError.message}`);
      }

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id || '');

      if (deleteError) {
        throw new Error(`Failed to delete notification: ${deleteError.message}`);
      }

      // Update local state
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Update unread count if needed
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  // Delete all notifications with optional filter
  const deleteAllNotificationsFromDB = async (filter: string | null, unreadOnly: boolean) => {
    if (!tenantId || !user?.id) {
      return { success: false, error: new Error('No tenant or user ID available') };
    }

    try {
      let query = supabase
        .from('notifications')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id);
      
      // Apply unread filter if specified
      if (unreadOnly) {
        query = query.eq('is_read', false);
      }
      
      // Apply type filter if specified
      if (filter && filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { error: deleteError } = await query;

      if (deleteError) {
        throw new Error(`Failed to delete notifications: ${deleteError.message}`);
      }

      // Update local state based on filters
      if (filter === 'all' && !unreadOnly) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        const newNotifications = notifications.filter(n => {
          if (unreadOnly && n.is_read) return true; // Keep read notifications
          if (filter && filter !== 'all' && n.type !== filter) return true; // Keep other types
          return false; // Delete matching notifications
        });
        
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.is_read).length);
      }
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  // Initial fetch
  useEffect(() => {
    if (tenantId && user?.id) {
      fetchNotifications();
    }
  }, [tenantId, user?.id, fetchNotifications]);

  // Set up real-time notifications if supported
  useEffect(() => {
    if (!tenantId || !user?.id || !checkNetworkStatus()) return;
    
    // Set up real-time subscription for new notifications
    const channel = supabase.channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `tenant_id=eq.${tenantId} AND user_id=eq.${user.id}`
        }, 
        (payload) => {
          // Handle different event types
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
            if (!(payload.new as Notification).is_read) {
              setUnreadCount(prev => prev + 1);
            }
          } 
          else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? payload.new as Notification : n)
            );
            // Recalculate unread count on updates
            setNotifications(current => {
              setUnreadCount(current.filter(n => !n.is_read).length);
              return current;
            });
          }
          else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as Notification;
            setNotifications(prev => prev.filter(n => n.id !== deleted.id));
            if (!deleted.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotificationsFromDB,
    refreshNotifications: fetchNotifications
  };
}
