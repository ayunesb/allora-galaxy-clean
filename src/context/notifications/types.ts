
export interface Notification {
  id: string;
  title: string;
  message: string;
  description?: string; // Added for compatibility
  user_id: string;
  tenant_id: string;
  created_at: string;
  read_at: string | null;
  type: string;
  metadata?: Record<string, any>;
  action_url?: string;
  action_label?: string;
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
