
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'system';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: string;
  user_id: string;
  tenant_id: string;
  created_at: string;
  is_read?: boolean;
  read_at?: string | null;
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
}

export interface CreateNotificationInput {
  title: string;
  description?: string;
  type?: NotificationType;
  user_id: string;
  tenant_id: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}
