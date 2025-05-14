
import { NotificationType } from './shared';

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
  action_url?: string | null;
  action_label?: string | null;
  metadata?: Record<string, any>;
}

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

// Notifications context type
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

// Helper function to convert between types
export const convertToNotificationContent = (notification: Notification): NotificationContent => ({
  id: notification.id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  timestamp: notification.created_at,
  read: notification.is_read,
  action_url: notification.action_url || undefined,
  action_label: notification.action_label || undefined,
  metadata: notification.metadata
});

export const convertToNotification = (content: NotificationContent, userId: string, tenantId: string): Notification => ({
  id: content.id,
  title: content.title,
  message: content.message,
  type: content.type,
  created_at: content.timestamp,
  read_at: content.read ? new Date().toISOString() : null,
  is_read: content.read,
  user_id: userId,
  tenant_id: tenantId,
  action_url: content.action_url || null,
  action_label: content.action_label || null,
  metadata: content.metadata
});
