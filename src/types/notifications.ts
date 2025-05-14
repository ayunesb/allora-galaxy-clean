
import { DateRange } from 'react-day-picker';

// Evolution filter type
export interface EvolutionFilter {
  dateRange?: DateRange;
  type?: string;
  status?: string;
  searchTerm?: string;
}

// Notification content type for the UI
export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  created_at: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
}

// Database notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read_at: string | null;
  tenant_id: string;
  user_id: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

// Function to convert a database notification to a UI notification
export function convertToNotificationContent(notification: Notification): NotificationContent {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as 'info' | 'success' | 'warning' | 'error' | 'system',
    created_at: notification.created_at,
    read: !!notification.read_at,
    action_url: notification.action_url,
    action_label: notification.action_label
  };
}
