
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Notification, NotificationsContextValue } from './notifications/types';

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { tenant } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch notifications on mount and when tenant/user changes
  useEffect(() => {
    if (tenant?.id && user?.id) {
      fetchNotifications();
      return setupRealtimeSubscription();
    }
  }, [tenant?.id, user?.id]);

  const fetchNotifications = async () => {
    if (!tenant?.id || !user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read_at).length || 0);
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error loading notifications',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const setupRealtimeSubscription = () => {
    if (!tenant?.id || !user?.id) return;
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          if (newNotification.tenant_id === tenant.id) {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          if (updatedNotification.tenant_id === tenant.id) {
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
            
            // If it was marked as read, update the counter
            if (updatedNotification.read_at && !payload.old.read_at) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  };
  
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error marking notification as read',
        description: err.message,
        variant: 'destructive',
      });
    }
  };
  
  const markAllAsRead = async () => {
    if (!tenant?.id || !user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('tenant_id', tenant.id)
        .is('read_at', null);
        
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
      
      toast({
        title: 'All notifications marked as read',
      });
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error marking all as read',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        loading,
        error,
      }}
    >
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
