
export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  module?: string;
  created_at: string;
  updated_at?: string;
}

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: Error }>;
  deleteNotification: (id: string) => Promise<{ success: boolean; error?: Error }>;
  deleteAllNotificationsFromDB: (filter: string | null, unreadOnly: boolean) => Promise<{ success: boolean; error?: Error }>;
  refreshNotifications: () => Promise<{ success: boolean; error?: Error }>;
}
