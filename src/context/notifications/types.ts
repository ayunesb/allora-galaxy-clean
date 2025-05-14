
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
  type: string;
  description?: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  action_url?: string;
  action_label?: string;
}

/**
 * NotificationsContext interface with consistent naming
 */
export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean; // Changed from loading to isLoading for consistency
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  error: Error | null;
}
