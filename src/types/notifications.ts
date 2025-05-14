
export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
  tenant_id: string;
  type: 'system' | 'alert' | 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
  action_url?: string | null;
  action_label?: string | null;
  metadata?: Record<string, any> | null;
}

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  type: 'system' | 'alert' | 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  type?: 'all' | 'unread' | 'system' | 'alert' | 'info';
  priority?: 'all' | 'low' | 'medium' | 'high';
  search?: string;
}

export interface NotificationState {
  notifications: NotificationContent[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  error: Error | null;
}

export const convertToNotificationContent = (notification: Notification): NotificationContent => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    timestamp: notification.created_at,
    read: notification.is_read,
    type: notification.type,
    priority: notification.priority,
    actionUrl: notification.action_url || undefined,
    actionLabel: notification.action_label || undefined,
    metadata: notification.metadata
  };
};
