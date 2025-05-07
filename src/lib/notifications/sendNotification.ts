
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { notifyError, notifySuccess, notifyWarning, notifyInfo } from '@/components/ui/BetterToast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  tenant_id: string;
  user_id: string;
  action_url?: string;
  action_label?: string;
  silent?: boolean;
  webhook_targets?: string[];
  metadata?: Record<string, any>;
}

/**
 * Send a notification to a user and optionally to configured webhooks
 */
export async function sendNotification(data: NotificationData): Promise<string | null> {
  try {
    const {
      title,
      message,
      type,
      tenant_id,
      user_id,
      action_url,
      action_label,
      silent = false,
      webhook_targets,
      metadata
    } = data;

    // Create the notification in the database
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        id: uuidv4(),
        title,
        message,
        type,
        tenant_id,
        user_id,
        action_url,
        action_label,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    // Show UI notification if not silent
    if (!silent) {
      switch (type) {
        case 'success':
          notifySuccess(title, message);
          break;
        case 'warning':
          notifyWarning(title, message);
          break;
        case 'error':
          notifyError(title, message);
          break;
        default:
          notifyInfo(title, message);
      }
    }

    // Send to webhooks if configured
    if (webhook_targets && webhook_targets.length > 0) {
      await sendToWebhooks(notification, webhook_targets, tenant_id);
    }

    return notification.id;
  } catch (err: any) {
    console.error("Unexpected error in sendNotification:", err);
    // Log the error but don't break the app
    try {
      await logSystemEvent(
        data.tenant_id,
        'notifications',
        'notification_error',
        { error: err.message, title: data.title }
      );
    } catch (logError) {
      console.error("Failed to log notification error:", logError);
    }
    return null;
  }
}

/**
 * Send notification data to configured webhook endpoints
 */
async function sendToWebhooks(
  notification: any,
  webhookUrls: string[],
  tenant_id: string
): Promise<void> {
  try {
    // Prepare notification payload
    const payload = {
      notification_id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      created_at: notification.created_at,
      tenant_id: notification.tenant_id,
      metadata: notification.metadata || {},
      action_url: notification.action_url
    };

    // Send to each webhook in parallel
    const webhookPromises = webhookUrls.map(async (webhookUrl) => {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Source': 'Allora-OS-Notification',
            'X-Tenant-ID': tenant_id
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Webhook failed with status: ${response.status}`);
        }

        return true;
      } catch (webhookError: any) {
        console.error(`Error sending to webhook ${webhookUrl}:`, webhookError);
        
        // Log webhook failure
        await logSystemEvent(
          tenant_id,
          'webhooks',
          'webhook_delivery_failed',
          { 
            webhook_url: webhookUrl,
            notification_id: notification.id,
            error: webhookError.message
          }
        ).catch(logError => {
          console.error("Failed to log webhook error:", logError);
        });
        
        return false;
      }
    });

    // Wait for all webhook requests to complete
    await Promise.allSettled(webhookPromises);
  } catch (err: any) {
    console.error("Error in sendToWebhooks:", err);
    
    // Log the webhook error
    await logSystemEvent(
      tenant_id,
      'webhooks',
      'webhook_system_error',
      { error: err.message }
    ).catch(logError => {
      console.error("Failed to log webhook system error:", logError);
    });
  }
}

/**
 * Subscribe to specific events for notifications
 * @param eventType The type of event to subscribe to
 * @param handler Function to handle the notification
 */
export function subscribeToNotifications(
  eventType: string, 
  handler: (data: any) => void
): () => void {
  // This is a placeholder for a more sophisticated event system
  // In a real implementation, this would connect to WebSockets or similar
  
  const channelName = `notification:${eventType}`;
  
  // Set up event listener or subscription
  // For now, we'll use a simple registration mechanism
  window.addEventListener(channelName, (e: any) => {
    handler(e.detail);
  });
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener(channelName, (e: any) => {
      handler(e.detail);
    });
  };
}

/**
 * Send a scheduled notification that will be delivered at a specific time
 */
export async function scheduleNotification(
  data: NotificationData & { scheduled_for: Date }
): Promise<string | null> {
  try {
    const { scheduled_for, ...notificationData } = data;
    
    // Insert into scheduled_notifications table
    const { data: scheduledNotification, error } = await supabase
      .from('scheduled_notifications')
      .insert({
        id: uuidv4(),
        notification_data: notificationData,
        scheduled_for: scheduled_for.toISOString(),
        tenant_id: notificationData.tenant_id,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
    
    return scheduledNotification.id;
  } catch (err: any) {
    console.error("Error in scheduleNotification:", err);
    return null;
  }
}
