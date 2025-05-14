
import { createContext } from 'react';
import { NotificationsContextValue } from '@/types/notifications';

// Create context with default values
const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refreshNotifications: async () => {},
  error: null,
});

export default NotificationsContext;
