
import { ReactNode } from 'react';

export enum NotificationType {
  System = 'system',
  Strategy = 'strategy',
  Agent = 'agent',
  Update = 'update',
  Error = 'error',
  Info = 'info',
  Success = 'success',
  Warning = 'warning'
}

export enum NotificationPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  read: boolean;
  createdAt: string;
  action?: NotificationAction;
  metadata?: Record<string, any>;
  tenant_id?: string;
  user_id?: string;
  // Legacy fields for backward compatibility
  read_at?: string | null;
  is_read?: boolean;
  created_at?: string;
  action_url?: string;
  action_label?: string;
  description?: string;
}

export interface NotificationAction {
  label: string;
  url: string;
}

// Alias for backward compatibility
export type NotificationContent = Notification;

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  filters: {
    type: NotificationType | 'all';
    read: boolean | 'all';
  };
}

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  filters: {
    type: NotificationType | 'all';
    read: boolean | 'all';
  };
  setFilters: (filters: Partial<NotificationState['filters']>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  showToast: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
}

export interface NotificationProviderProps {
  children: ReactNode;
}

export interface NotificationDisplay {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  action?: {
    label: string;
    url: string;
  };
}

export interface NotificationFilter {
  type?: NotificationType | 'all';
  read?: boolean | 'all';
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  tenant_id: string;
  user_id: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}
