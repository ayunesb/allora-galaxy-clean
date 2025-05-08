
// Base notification content interface for frontend use
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

// Database notification structure
export interface Notification {
  id: string;
  title: string;
  description: string; // This maps to 'message' in the UI
  created_at: string;
  is_read?: boolean;
  read_at?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  action_url?: string;
  action_label?: string;
  tenant_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

// Context for notifications management
export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: Error }>;
  deleteNotification: (id: string) => Promise<{ success: boolean; error?: Error }>;
}
