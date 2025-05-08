
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { v4 as uuidv4 } from 'uuid';

interface SendNotificationParams {
  tenant_id: string;
  user_id: string;
  title: string;
  description: string; // Changed from message to description to match DB schema
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  action_url?: string;
  action_label?: string;
  is_read?: boolean;
}

/**
 * Send a notification to a specific user
 * @returns The newly created notification or undefined if there was an error
 */
export async function sendNotification({
  tenant_id,
  user_id,
  title,
  description,
  type = 'info',
  action_url,
  action_label,
  is_read = false
}: SendNotificationParams): Promise<Notification | undefined> {
  try {
    const notification = {
      id: uuidv4(),
      tenant_id,
      user_id,
      title,
      description, // Directly using description for DB schema
      type,
      is_read,
      action_url,
      action_label
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('Error sending notification:', error);
      return undefined;
    }

    return data as Notification;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    return undefined;
  }
}

/**
 * Send the same notification to multiple users
 */
export async function broadcastNotification({
  tenant_id,
  user_ids,
  title,
  description,
  type = 'info',
  action_url,
  action_label
}: Omit<SendNotificationParams, 'user_id'> & { user_ids: string[] }): Promise<(Notification | undefined)[]> {
  const notifications = await Promise.all(
    user_ids.map(user_id =>
      sendNotification({
        tenant_id,
        user_id,
        title,
        description,
        type,
        action_url,
        action_label
      })
    )
  );

  return notifications;
}
