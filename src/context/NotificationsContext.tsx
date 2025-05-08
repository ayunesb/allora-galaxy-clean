
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';
import { useTenantId } from '@/hooks/useTenantId';

interface NotificationsContextType {
  notifications: Notification[];
  loading: boolean;
  error: Error | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: Error }>;
  deleteNotification: (id: string) => Promise<{ success: boolean; error?: Error }>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  loading: false,
  error: null,
  isOpen: false,
  setIsOpen: () => {},
  refreshNotifications: async () => {},
  markAsRead: async () => ({ success: false }),
  markAllAsRead: async () => ({ success: false }),
  deleteNotification: async () => ({ success: false }),
});

export const useNotificationsContext = () => useContext(NotificationsContext);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tenantId = useTenantId();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  const markAsRead = async (id: string): Promise<{ success: boolean; error?: Error }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { success: false, error: err as Error };
    }
  };

  const markAllAsRead = async (): Promise<{ success: boolean; error?: Error }> => {
    if (!tenantId) return { success: false, error: new Error('No tenant ID available') };
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('tenant_id', tenantId)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return { success: false, error: err as Error };
    }
  };

  const deleteNotification = async (id: string): Promise<{ success: boolean; error?: Error }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting notification:', err);
      return { success: false, error: err as Error };
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
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
