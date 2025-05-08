
export interface Notification {
  id: string;
  title: string;
  message?: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  created_at: string;
  read_at?: string | null;
  is_read?: boolean;
  action_url?: string;
  action_label?: string;
  tenant_id: string;
  user_id: string;
}

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  action_url?: string;
  action_label?: string;
}

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: Error }>;
  deleteNotification: (id: string) => Promise<{ success: boolean; error?: Error }>;
  refreshNotifications: () => Promise<{ success: boolean; error?: Error }>;
}
