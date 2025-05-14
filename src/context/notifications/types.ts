
import { NotificationType } from '@/types/notifications';

/**
 * Notification data structure from the database
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  user_id: string;
  tenant_id: string;
  created_at: string;
  read_at: string | null;
  type: NotificationType;
  is_read: boolean;
  metadata?: Record<string, any>;
  action_url?: string;
  action_label?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * NotificationsContext interface
 */
export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<{ success: boolean; error?: any }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: any }>;
  deleteNotification: (id: string) => Promise<{ success: boolean; error?: any }>;
  refreshNotifications: () => Promise<{ success: boolean; error?: any }>;
  error: Error | null;
}
