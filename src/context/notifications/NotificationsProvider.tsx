
import React, { useState, useCallback } from 'react';
import { Notification } from '@/types/notifications';
import NotificationsContext from './NotificationsContext';
import { useToast } from '@/hooks/use-toast';

export const NotificationsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Add a new notification
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Display toast for certain types of notifications
    if (notification.metadata?.priority === 'high') {
      toast({
        title: notification.title,
        description: notification.description || '',
        variant: "destructive"
      });
    }
  }, [toast]);

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id && !notification.read_at
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prev => 
      prev > 0 ? prev - 1 : 0
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications(prev => 
      prev.map(notification => 
        !notification.read_at
          ? { ...notification, read_at: now }
          : notification
      )
    );
    
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const contextValue = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
