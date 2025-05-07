
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const { currentTenant } = useWorkspace();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id || !currentTenant?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match our Notification type
      const typedNotifications = data.map(item => ({
        id: item.id,
        title: item.title,
        message: item.description || '',
        type: (item.type || 'info') as 'info' | 'success' | 'warning' | 'error',
        created_at: item.created_at,
        read_at: item.is_read ? item.updated_at : null,
        tenant_id: item.tenant_id,
        user_id: item.user_id,
        action_url: item.action_url,
        action_label: item.action_label
      }));
      
      setNotifications(typedNotifications);
      
      // Calculate unread count
      const unread = data.filter(notification => !notification.is_read).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentTenant?.id]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read_at: new Date().toISOString() } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return { success: true };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id || !currentTenant?.id) return { success: false, error: new Error('No user or tenant') };
    
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: now })
        .eq('tenant_id', currentTenant.id)
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read_at: now }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      toast({
        title: 'All notifications marked as read',
        description: 'Your notifications have been updated',
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Failed to mark notifications as read',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  }, [user?.id, currentTenant?.id, toast]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const deleted = notifications.find(notification => notification.id === id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Update unread count if needed
      if (deleted && !deleted.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed',
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Failed to delete notification',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  }, [notifications, toast]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id || !currentTenant?.id) return;

    fetchNotifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
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
  }, [user?.id, currentTenant?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
  };
};
