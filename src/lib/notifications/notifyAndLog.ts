
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { SystemEventType } from '@/types/shared';

export interface NotificationOptions {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  tenantId: string;
  userId?: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Creates a new notification and logs it as a system event
 * @param options The notification options
 * @returns A promise that resolves to the notification ID
 */
export async function createNotification(options: NotificationOptions): Promise<string | null> {
  const {
    title,
    message,
    type,
    tenantId,
    userId,
    metadata = {},
    actionUrl,
    actionLabel
  } = options;
  
  try {
    if (!tenantId) {
      console.error('Tenant ID is required to create a notification');
      return null;
    }
    
    // If no user ID provided, try to get the current user
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      effectiveUserId = user?.id;
    }
    
    if (!effectiveUserId) {
      console.error('User ID is required to create a notification');
      return null;
    }
    
    // Create the notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title,
        message,
        type,
        tenant_id: tenantId,
        user_id: effectiveUserId,
        metadata,
        action_url: actionUrl,
        action_label: actionLabel
      })
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log the notification creation as a system event
    await logSystemEvent(
      'notification' as any, // Cast to any as a temporary fix for strict type checking
      'info' as SystemEventType,
      {
        notification_id: data.id,
        notification_type: type,
        user_id: effectiveUserId,
        tenant_id: tenantId
      },
      tenantId
    );
    
    return data.id;
  } catch (err: any) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
}

/**
 * Marks a notification as read
 * @param notificationId The notification ID to mark as read
 * @returns A promise that resolves to true if successful
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
      
    if (error) {
      throw error;
    }
    
    // Get notification details
    const { data: notification } = await supabase
      .from('notifications')
      .select('tenant_id, user_id')
      .eq('id', notificationId)
      .single();
    
    if (notification) {
      // Log the notification read as a system event
      await logSystemEvent(
        'notification' as any, // Cast to any as a temporary fix for strict type checking
        'info' as SystemEventType,
        {
          notification_id: notificationId,
          user_id: notification.user_id,
          action: 'mark_as_read'
        },
        notification.tenant_id
      );
    }
    
    return true;
  } catch (err: any) {
    console.error('Failed to mark notification as read:', err.message);
    return false;
  }
}
