
/**
 * Notification types for the application
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'milestone';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  tenant_id: string;
  user_id: string;
  is_read?: boolean;
  action_url?: string;
  action_label?: string;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
}

export interface CreateNotificationInput {
  title: string;
  description?: string;
  type: NotificationType;
  tenant_id: string;
  user_id: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  is_read?: boolean;
}

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType | string;
  action_url?: string;
  action_label?: string;
}

export interface NotificationsContextType {
  notifications: Notification[];
  loading: boolean;
  error: Error | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  unreadCount: number;
}
