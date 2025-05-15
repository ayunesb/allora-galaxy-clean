
export interface Notification {
  id: string;
  title: string;
  message: string; // Added to ensure compatibility
  description?: string; // Added for backward compatibility
  user_id: string;
  tenant_id: string;
  created_at: string;
  read_at: string | null;
  type: string;
  metadata?: Record<string, any>;
  action_url?: string;
  action_label?: string;
  priority?: 'high' | 'medium' | 'low'; // Added priority field
  is_read?: boolean; // For backward compatibility
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
  // Added missing properties
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}
