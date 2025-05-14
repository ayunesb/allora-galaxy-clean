
import { createContext } from 'react';
import { Notification } from '@/types/notifications';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const defaultContext: NotificationsContextType = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {}
};

const NotificationsContext = createContext<NotificationsContextType>(defaultContext);

export default NotificationsContext;
