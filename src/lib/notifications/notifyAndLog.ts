
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface NotifyParams {
  title: string;
  message: string;
  tenant_id: string;
  user_id: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates a notification and logs the event to system logs
 * @param params Notification parameters
 * @returns Success status and data
 */
export async function notifyAndLog(params: NotifyParams): Promise<{ success: boolean, data?: any, error?: string }> {
  try {
    // Create notification
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        title: params.title,
        message: params.message,
        tenant_id: params.tenant_id,
        user_id: params.user_id,
        type: params.type || 'info',
        action_url: params.action_url,
        action_label: params.action_label,
        metadata: params.metadata || {}
      })
      .select()
      .single();

    // Log event to system logs
    await logSystemEvent(
      params.tenant_id,
      'system', 
      'notification_created',
      {
        notification_id: notification?.id,
        title: params.title,
        type: params.type,
        user_id: params.user_id
      }
    );

    // Handle notification creation error
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      return { success: false, error: notificationError.message };
    }

    return { success: true, data: notification };
  } catch (err: any) {
    console.error('Error in notifyAndLog:', err);
    
    try {
      // Attempt to log the error
      await logSystemEvent(
        params.tenant_id || 'system',
        'system',
        'notification_creation_error',
        {
          title: params.title,
          error: err.message
        }
      );
    } catch (logErr) {
      console.error('Failed to log notification error:', logErr);
    }
    
    return { success: false, error: err.message || 'Unknown error in notification system' };
  }
}
