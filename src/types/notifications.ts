
export type NotificationType = 'system' | 'campaign' | 'user' | 'strategy' | 'plugin' | 'agent' | 'info' | 'success' | 'warning' | 'error';

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
  message: string;
  description?: string; // Keep both for backward compatibility
  user_id: string;
  tenant_id: string;
  is_read?: boolean;
  created_at: string;
  updated_at?: string;
  read_at: string | null; // Updated from string | undefined to string | null
  type: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  priority?: 'high' | 'medium' | 'low'; // Added priority field
}

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export interface CreateNotificationInput {
  title: string;
  description?: string;
  message?: string; // Added for consistency
  tenant_id: string;
  user_id: string;
  type?: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  priority?: 'high' | 'medium' | 'low'; // Added priority field
}
