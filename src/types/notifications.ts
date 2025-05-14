
// Notification type definitions
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'system';

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
  tenant_id: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

/**
 * Convert a notification from database format to UI display format
 */
export function convertToNotificationContent(notification: BaseNotification): NotificationContent {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as NotificationType,
    read: notification.is_read,
    timestamp: notification.created_at,
    actionUrl: notification.action_url,
    actionLabel: notification.action_label,
    metadata: notification.metadata
  };
}
