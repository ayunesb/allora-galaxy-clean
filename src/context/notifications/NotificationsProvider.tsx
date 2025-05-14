
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { NotificationsContextValue, Notification } from './types';
import { supabase } from '@/lib/supabase';
import { useNotificationsState } from '@/hooks/useNotificationsState';
import { useRealtimeNotifications } from './useRealtimeNotifications';
import NotificationsContext from './NotificationsContext';

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  
  // Fetch user ID on mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUserId();
  }, []);

  // Use our custom hooks to handle notifications state
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setNotifications,
    setUnreadCount
  } = useNotificationsState(userId);

  // Handle new notifications from realtime subscription
  const handleNewNotification = useCallback((newNotification: Notification) => {
    setNotifications(prev => [newNotification, ...prev]);
    
    if (!newNotification.read_at) {
      setUnreadCount(prev => prev + 1);
    }
  }, [setNotifications, setUnreadCount]);

  // Setup realtime subscription
  useRealtimeNotifications({ 
    userId, 
    onNewNotification: handleNewNotification 
  });

  // Create the context value from our state
  const contextValue: NotificationsContextValue = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    error
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};
