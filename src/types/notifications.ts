
import { BaseEntity } from './shared';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: NotificationType;
  user_id: string;
  tenant_id: string;
  read_at: string | null;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
  search?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}
