
import { supabase } from '@/lib/supabase';
import { NotificationType } from '@/types/notifications';

/**
 * Send a notification to a user
 */
export interface SendNotificationProps {
  tenant_id: string;
  user_id: string;
  title: string;
  description: string;
  type: NotificationType;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

/**
 * Send a notification to a user
 * @param props Notification properties
 * @returns The created notification or undefined if creation failed
 */
export const sendNotification = async (props: SendNotificationProps) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        tenant_id: props.tenant_id,
        user_id: props.user_id,
        title: props.title,
        message: props.description,  // Map to 'message' field in the DB
        type: props.type,
        action_url: props.action_url,
        action_label: props.action_label,
        metadata: props.metadata || {},
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error sending notification:', error);
      return undefined;
    }
    
    return data;
  } catch (err: any) {
    console.error('Failed to send notification:', err);
    return undefined;
  }
};

/**
 * Format a notification timestamp into a human-readable string
 * @param timestamp ISO timestamp string
 * @returns Formatted time string
 */
export const formatNotificationTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // For older notifications, show the date
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting notification time:', error);
    return 'Unknown time';
  }
};

/**
 * Check if a notification has been read
 * @param readAt The read_at timestamp from the notification
 * @returns Boolean indicating if the notification has been read
 */
export const isNotificationRead = (readAt: string | null | false): boolean => {
  return readAt !== null && readAt !== false;
};
