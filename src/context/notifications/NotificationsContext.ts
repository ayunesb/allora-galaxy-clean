
import { createContext } from 'react';
import { NotificationsContextValue } from './types';

// Create context with default values
const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  isLoading: false, // Changed from loading to isLoading
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refreshNotifications: async () => {},
  error: null,
});

export default NotificationsContext;
