
import React from 'react';
import { NotificationsContextValue } from './types';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationsContext from './NotificationsContext';

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  // Use our standardized hooks for notification management
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications({
    autoLoad: true,
    showToasts: true
  });
  
  // Create context value from our hooks
  const contextValue: NotificationsContextValue = {
    notifications: notifications.map(n => ({
      ...n,
      read_at: n.is_read ? new Date().toISOString() : null
    })),
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
