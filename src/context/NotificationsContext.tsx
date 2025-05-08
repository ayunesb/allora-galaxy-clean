
import React, { createContext, useContext, useState } from 'react';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { type Notification, type NotificationsContextType } from '@/types/notifications';
import { useTenantId } from '@/hooks/useTenantId';

// Create the context with default values
const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  loading: false,
  error: null,
  isOpen: false,
  setIsOpen: () => {},
  refreshNotifications: async () => { return Promise.resolve() },
  markAsRead: async () => { return Promise.resolve() },
  markAllAsRead: async () => { return Promise.resolve() },
  deleteNotification: async () => { return Promise.resolve() },
  unreadCount: 0,
});

export interface NotificationsProviderProps {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tenantId = useTenantId();
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications: refresh,
    markAsRead: mark,
    markAllAsRead: markAll,
    deleteNotification: deleteNotif,
  } = useNotifications();

  // Wrap the functions to conform to the expected return type
  const refreshNotifications = async () => {
    await refresh();
  };
  
  const markAsRead = async (id: string) => {
    await mark(id);
  };
  
  const markAllAsRead = async () => {
    await markAll();
  };
  
  const deleteNotification = async (id: string) => {
    await deleteNotif(id);
  };
  
  // Set up polling for new notifications
  React.useEffect(() => {
    // Only poll if we have a tenant ID
    if (!tenantId) return;
    
    // Initial fetch
    refreshNotifications();
    
    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      refreshNotifications();
    }, 30000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [tenantId]);
  
  const contextValue: NotificationsContextType = {
    notifications,
    loading,
    error,
    isOpen,
    setIsOpen,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount
  };
  
  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Custom hook to use the notifications context
export const useNotificationsContext = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  
  return context;
};
