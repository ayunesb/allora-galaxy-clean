
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface NotificationInput {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  tenantId: string;
  userId: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

/**
 * Send a notification to a user and log it
 * 
 * @param input Notification data
 * @returns Result of the notification operation
 */
export async function notifyAndLog(input: NotificationInput): Promise<NotificationResult> {
  const {
    title,
    message,
    type,
    tenantId,
    userId,
    actionUrl,
    actionLabel,
    metadata = {}
  } = input;
  
  try {
    // Insert notification into database
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title,
        message,
        type,
        tenant_id: tenantId,
        user_id: userId,
        action_url: actionUrl,
        action_label: actionLabel,
        metadata
      })
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log the notification event
    await logSystemEvent(
      'notification',
      'info',
      {
        notification_id: data.id,
        title,
        type,
        user_id: userId
      },
      tenantId
    );
    
    return {
      success: true,
      notificationId: data.id
    };
  } catch (error: any) {
    console.error('Error creating notification:', error);
    
    // Log the error
    logSystemEvent(
      'notification',
      'error',
      {
        error: error.message,
        title,
        type,
        user_id: userId
      },
      tenantId
    ).catch(err => {
      console.warn('Failed to log notification error:', err);
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mark a notification as read
 * 
 * @param notificationId ID of the notification
 * @param userId ID of the user
 * @returns Whether the operation was successful
 */
export async function markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}
