
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { notifyInfo, notifySuccess, notifyWarning } from '@/components/ui/BetterToast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  read_at: string | null;
  tenant_id: string;
  user_id: string;
  action_url?: string;
  action_label?: string;
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { currentTenant } = useWorkspace();
  
  const fetchNotifications = async () => {
    if (!user || !currentTenant) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setNotifications(data || []);
    } catch (err: any) {
      setError(err);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif
        )
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const markAllAsRead = async () => {
    if (!user || !currentTenant) return;
    
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('tenant_id', currentTenant.id)
        .is('read_at', null);
      
      if (updateError) throw updateError;
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: notif.read_at || new Date().toISOString() }))
      );
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const deleteNotification = async (id: string) => {
    if (!user) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user || !currentTenant) return;
    
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Only handle notifications for current tenant
          if (newNotification.tenant_id === currentTenant.id) {
            setNotifications(prev => [newNotification, ...prev]);
            
            // Show a toast for the new notification
            switch (newNotification.type) {
              case 'success':
                notifySuccess(newNotification.title, newNotification.message);
                break;
              case 'warning':
                notifyWarning(newNotification.title, newNotification.message);
                break;
              case 'error':
                notifyWarning(newNotification.title, newNotification.message);
                break;
              default:
                notifyInfo(newNotification.title, newNotification.message);
                break;
            }
          }
        }
      )
      .subscribe();
    
    // Initial fetch
    fetchNotifications();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentTenant]);
  
  const unreadCount = notifications.filter(n => !n.read_at).length;
  
  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  };
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
