
export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  action_url?: string; 
  action_label?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
}

export const convertToNotificationContent = (notification: Notification): NotificationContent => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: notification.is_read,
    created_at: notification.created_at,
    action_url: notification.action_url,
    action_label: notification.action_label
  };
};

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error?: Error | null;
  markAsRead: (id: string) => Promise<any>;
  markAllAsRead: () => Promise<any>;
  deleteNotification: (id: string) => Promise<any>;
  refreshNotifications: () => Promise<any>;
}
