
export interface Notification {
  id: string;
  title: string;
  message: string;
  user_id: string;
  tenant_id: string;
  created_at: string;
  read_at: string | null;
  type: string;
  metadata?: Record<string, any>;
  action_url?: string;
  action_label?: string;
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
