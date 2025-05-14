
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
    if (notification.metadata?.priority === 'high' || notification.priority === 'high') {
      toast({
        title: notification.title,
        description: notification.description || '',
        variant: "destructive"
      });
    }
  }, [toast]);

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string): Promise<void> => {
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
    
    return Promise.resolve();
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const now = new Date().toISOString();
    setNotifications(prev => 
      prev.map(notification => 
        !notification.read_at
          ? { ...notification, read_at: now }
          : notification
      )
    );
    
    setUnreadCount(0);
    
    return Promise.resolve();
  }, []);

  const deleteNotification = useCallback(async (id: string): Promise<void> => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    // Update unread count if necessary
    setNotifications(prev => {
      const deletedNotification = prev.find(n => n.id === id);
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== id);
    });
    
    return Promise.resolve();
  }, []);

  const refreshNotifications = useCallback(async (): Promise<void> => {
    // This would typically fetch from an API
    // In this mock implementation, we'll just resolve the promise
    return Promise.resolve();
  }, []);

  const contextValue = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    clearNotifications: useCallback(() => {
      setNotifications([]);
      setUnreadCount(0);
    }, []),
    loading: false,
    error: null
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
