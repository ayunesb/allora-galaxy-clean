
export type NotificationType = 'system' | 'campaign' | 'user' | 'strategy' | 'plugin' | 'agent';

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

export interface Notification {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  tenant_id: string;
  is_read?: boolean;
  created_at: string;
  updated_at?: string;
  type: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}
