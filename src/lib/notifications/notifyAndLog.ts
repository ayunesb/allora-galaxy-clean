
import { sendNotification } from './sendNotification';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { Notification } from '@/types/notifications';

/**
 * Send a notification and log it as a system event
 * 
 * @param params Notification parameters
 * @returns The created notification or undefined if there was an error
 */
export async function notifyAndLog({
  tenant_id,
  user_id,
  title,
  description,
  type = 'info',
  action_url,
  action_label,
  module = 'notifications',
  is_read = false
}: {
  tenant_id: string;
  user_id: string;
  title: string;
  description: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  action_url?: string;
  action_label?: string;
  module?: string;
  is_read?: boolean;
}): Promise<Notification | undefined> {
  try {
    // First, log the event
    await logSystemEvent(tenant_id, module, `notification_sent:${type}`, {
      title,
      user_id,
      action_url
    });
    
    // Then, send the notification
    const notification = await sendNotification({
      tenant_id,
      user_id,
      title,
      description,
      type,
      action_url,
      action_label,
      is_read
    });
    
    return notification;
  } catch (error) {
    console.error('Error in notifyAndLog:', error);
    return undefined;
  }
}

/**
 * Send system notifications to all users in a tenant
 */
export async function notifySystemEvent({
  tenant_id,
  user_ids,
  title,
  description,
  event,
  module = 'system',
  action_url,
  action_label
}: {
  tenant_id: string;
  user_ids: string[];
  title: string;
  description: string;
  event: string;
  module?: string;
  action_url?: string;
  action_label?: string;
}): Promise<(Notification | undefined)[]> {
  // Log the system event first
  await logSystemEvent(tenant_id, module, event, {
    title,
    affected_users: user_ids.length
  });
  
  // Send notifications to all affected users
  const notifications = await Promise.all(
    user_ids.map(user_id =>
      sendNotification({
        tenant_id,
        user_id,
        title,
        description,
        type: 'system',
        action_url,
        action_label
      })
    )
  );
  
  return notifications;
}
