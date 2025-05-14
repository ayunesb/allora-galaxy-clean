
import { createContext } from 'react';
import { Notification } from '@/types/notifications';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  clearNotifications: () => void;
  loading: boolean;
  error: Error | null;
}

const defaultContext: NotificationsContextType = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => Promise.resolve(),
  markAllAsRead: () => Promise.resolve(),
  deleteNotification: () => Promise.resolve(),
  refreshNotifications: () => Promise.resolve(),
  clearNotifications: () => {},
  loading: false,
  error: null
};

const NotificationsContext = createContext<NotificationsContextType>(defaultContext);

export default NotificationsContext;
