
/**
 * Notification types for the application
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'milestone';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  tenant_id: string;
  user_id: string;
  is_read?: boolean;
  action_url?: string;
  action_label?: string;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
}

export interface CreateNotificationInput {
  title: string;
  description?: string;
  type: NotificationType;
  tenant_id: string;
  user_id: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  loading: boolean;
  refetch: () => void;
  filterByType: (type: NotificationType | 'all') => void;
  currentFilter: NotificationType | 'all';
}
