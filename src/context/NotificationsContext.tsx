
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationsContextType } from '@/types/notifications';
import { useTenantId } from '@/hooks/useTenantId';

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  loading: false,
  error: null,
  isOpen: false,
  setIsOpen: () => {},
  refreshNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  unreadCount: 0,
});

export const useNotificationsContext = () => useContext(NotificationsContext);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tenantId = useTenantId();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const markAsRead = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!tenantId) throw new Error('No tenant ID available');
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  const deleteNotification = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchNotifications();
      
      // Subscribe to new notifications
      const channel = supabase
        .channel('notification_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `tenant_id=eq.${tenantId}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [tenantId]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        loading,
        error,
        isOpen,
        setIsOpen,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
