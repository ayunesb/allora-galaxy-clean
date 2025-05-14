
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  user_id: string;
  tenant_id: string;
  created_at: string;
  read_at: string | null;
  action_label?: string | null;
  action_url?: string | null;
  metadata?: Record<string, any> | null;
  is_read?: boolean; // For compatibility with context/notifications/types
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  error?: Error | null;
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
}

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date | string;
  read: boolean;
  action_url?: string;
  action_label?: string;
}
