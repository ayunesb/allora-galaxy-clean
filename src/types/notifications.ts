
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
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
}
