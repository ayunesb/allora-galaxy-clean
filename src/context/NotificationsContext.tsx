import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { notifyInfo, notifySuccess, notifyWarning } from '@/components/ui/BetterToast';
import { supabase } from '@/lib/supabase';
import { 
  subscribeToNotifications,
  fetchNotifications as fetchNotificationsService 
} from '@/services/notificationService';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { Notification, NotificationsContextValue } from '@/types/notifications';

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { currentTenant } = useWorkspace();
  
  const { markAsRead: markAsReadAction, markAllAsRead: markAllAsReadAction, removeNotification } = useNotificationActions();
  
  const fetchNotifications = async () => {
    if (!user || !currentTenant) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await fetchNotificationsService(user.id, currentTenant.id);
      
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
    const { success } = await markAsReadAction(id);
    
    if (success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif
        )
      );
    }
  };
  
  const markAllAsRead = async () => {
    const { success } = await markAllAsReadAction();
    
    if (success) {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: notif.read_at || new Date().toISOString() }))
      );
    }
  };
  
  const deleteNotification = async (id: string) => {
    const { success } = await removeNotification(id);
    
    if (success) {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }
  };

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user || !currentTenant) return;
    
    // Initial fetch
    fetchNotifications();
    
    // Setup subscription
    const channel = subscribeToNotifications(currentTenant.id, user.id, (newNotification: Notification) => {
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
    });
    
    return () => {
      // Safely handle removeChannel method
      if ('removeChannel' in supabase.realtime) {
        supabase.realtime.removeChannel(channel);
      }
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

export type { Notification } from '@/types/notifications';
