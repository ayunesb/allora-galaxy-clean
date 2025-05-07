
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/context/NotificationsContext';
import { v4 as uuidv4 } from 'uuid';

interface SendNotificationParams {
  tenant_id: string;
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  action_label?: string;
}

/**
 * Send a notification to a specific user
 * @returns The newly created notification or undefined if there was an error
 */
export async function sendNotification({
  tenant_id,
  user_id,
  title,
  message,
  type = 'info',
  action_url,
  action_label
}: SendNotificationParams): Promise<Notification | undefined> {
  try {
    const notification = {
      id: uuidv4(),
      tenant_id,
      user_id,
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      read_at: null,
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
  message,
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
        message,
        type,
        action_url,
        action_label
      })
    )
  );

  return notifications;
}
