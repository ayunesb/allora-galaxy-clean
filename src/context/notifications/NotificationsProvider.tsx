import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast, ToastProps } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextProps {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  showToast: (message: ToastProps) => void;
}

const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  
  useEffect(() => {
    // Load initial notifications from local storage or database
    // For simplicity, let's assume they are loaded from local storage
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);
  
  useEffect(() => {
    // Save notifications to local storage whenever they change
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 15),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
    
    // Optionally show a toast for the notification
    toast({
      title: notification.type === 'error' ? 'Error' : notification.type,
      description: notification.message,
    });
  };
  
  const markAsRead = async (notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
    
    // Simulate API call to mark as read in the database
    await new Promise(resolve => setTimeout(resolve, 500));
  };
  
  const markAllAsRead = async () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    
    // Simulate API call to mark all as read in the database
    await new Promise(resolve => setTimeout(resolve, 1000));
  };
  
  const showToast = (message: ToastProps) => {
    toast(message);
  };
  
  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        showToast,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
