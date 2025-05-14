
import { NotificationType } from './shared';

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  title?: string;
  message?: string;
  type?: string;
  read_at?: string | null;
  created_at: string;
  data?: any;
}

export const convertToNotificationContent = (notification: Notification): NotificationContent => {
  return {
    id: notification.id,
    title: notification.title || '',
    message: notification.message || '',
    type: (notification.type as NotificationType) || 'info',
    timestamp: notification.created_at,
    read: !!notification.read_at
  };
};
