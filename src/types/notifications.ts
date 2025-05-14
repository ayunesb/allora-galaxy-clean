
/**
 * Types of notifications displayed in the system
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert' | 'system';

/**
 * Input for creating a new notification
 */
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

/**
 * Database notification model
 */
export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  user_id: string;
  tenant_id: string;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

/**
 * UI-ready notification model
 */
export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  timestamp: string; // Uses created_at from database
  read: boolean; // Maps to is_read from database
  type: NotificationType;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

/**
 * Context value for notifications system
 */
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
