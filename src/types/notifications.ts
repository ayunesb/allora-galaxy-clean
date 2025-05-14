
import { NotificationType } from './shared';

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  title?: string;
  message?: string;
  type?: NotificationType;
  created_at: string;
  read_at?: string | null;
  action_url?: string;
  action_label?: string;
  data?: any;
}

export const convertToNotificationContent = (notification: Notification): NotificationContent => {
  return {
    id: notification.id,
    title: notification.title || '',
    message: notification.message || '',
    type: notification.type || 'info',
    timestamp: notification.created_at,
    read: !!notification.read_at,
    actionUrl: notification.action_url,
    actionLabel: notification.action_label
  };
};
