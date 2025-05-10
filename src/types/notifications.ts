export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert' | 'system';

export interface CreateNotificationInput {
  title: string;
  description?: string;
  type?: NotificationType;
  tenant_id: string;
  user_id: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  user_id: string;
  tenant_id: string;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
  description?: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  error: Error | null;
}
