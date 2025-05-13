
/**
 * Notification type definitions for Allora OS
 */

/**
 * Available notification types
 */
export type NotificationType = 'system' | 'campaign' | 'user' | 'strategy' | 'plugin' | 'agent' | 'info' | 'success' | 'warning' | 'error';

/**
 * Core notification interface
 */
export interface Notification {
  id: string;
  title: string;
  description?: string;
  message?: string; // For backward compatibility
  user_id: string;
  tenant_id: string;
  is_read?: boolean;
  created_at: string;
  updated_at?: string;
  read_at?: string | null;
  type: NotificationType | string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

/**
 * Normalized notification for UI display
 */
export interface NotificationDisplay {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  action_url?: string;
  action_label?: string;
  userId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

/**
 * Notification context value interface
 */
export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

/**
 * Input for creating a notification
 */
export interface CreateNotificationInput {
  title: string;
  description?: string;
  tenant_id: string;
  user_id: string;
  type?: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

/**
 * Filter options for notifications
 */
export interface NotificationFilter {
  type?: string | string[];
  read?: boolean;
  fromDate?: Date;
  toDate?: Date;
}
