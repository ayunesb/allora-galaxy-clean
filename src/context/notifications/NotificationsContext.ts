
import { createContext } from 'react';
import { NotificationsContextValue } from './types';

// Create context with default values
const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  markAsRead: async () => ({ success: false }),
  markAllAsRead: async () => ({ success: false }),
  deleteNotification: async () => ({ success: false }),
  refreshNotifications: async () => ({ success: false }),
  error: null,
});

export default NotificationsContext;
