
import { NotificationType } from './shared';

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
  tenant_id: string;
  user_id: string;
  type: NotificationType;
  priority?: 'low' | 'medium' | 'high';
  action_url?: string | null;
  action_label?: string | null;
  metadata?: Record<string, any> | null;
  description?: string;
}

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  type: NotificationType;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  type?: 'all' | 'unread' | NotificationType;
  priority?: 'all' | 'low' | 'medium' | 'high';
  search?: string;
}

export interface NotificationState {
  notifications: NotificationContent[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// Add CreateNotificationInput interface
export interface CreateNotificationInput {
  title: string;
  description?: string;
  type?: NotificationType;
  tenant_id: string;
  user_id: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
}

export const convertToNotificationContent = (notification: Notification): NotificationContent => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message || notification.description || '',
    timestamp: notification.created_at,
    read: notification.is_read,
    type: notification.type,
    priority: notification.priority,
    actionUrl: notification.action_url || undefined,
    actionLabel: notification.action_label || undefined,
    metadata: notification.metadata
  };
};
