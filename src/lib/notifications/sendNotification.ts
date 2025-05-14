
import { supabase } from '@/lib/supabase';
import { standardToast } from '@/lib/notifications/standardToast';

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface SendNotificationOptions {
  title: string;
  message: string;
  type?: NotificationType;
  userId?: string; // If not provided, sends to all users in the tenant
  tenantId: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  showToast?: boolean; // Whether to also show a toast notification
}

/**
 * Send a notification to one or all users in a tenant
 */
export async function sendNotification(options: SendNotificationOptions): Promise<{
  success: boolean;
  notificationId?: string;
  count?: number;
  error?: string;
}> {
  try {
    const {
      title,
      message,
      type = 'info',
      userId,
      tenantId,
      actionUrl,
      actionLabel,
      metadata,
      showToast = false
    } = options;
    
    if (!title) {
      throw new Error('Notification title is required');
    }
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    // Show toast if requested
    if (showToast) {
      switch (type) {
        case 'success':
          standardToast.success(title, message);
          break;
        case 'error':
          standardToast.error(title, message);
          break;
        case 'warning':
          standardToast.warning(title, message);
          break;
        default:
          standardToast.info(title, message);
      }
    }
    
    // Send to a specific user
    if (userId) {
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
          metadata: metadata || {}
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        notificationId: data.id
      };
    }
    
    // Send to all users in the tenant
    const { data: users, error: usersError } = await supabase
      .from('tenant_user_roles')
      .select('user_id')
      .eq('tenant_id', tenantId);
    
    if (usersError) throw usersError;
    
    if (!users || users.length === 0) {
      return {
        success: true,
        count: 0,
        notificationId: undefined
      };
    }
    
    // Prepare notifications for all tenant users
    const notifications = users.map(user => ({
      title,
      message,
      type,
      tenant_id: tenantId,
      user_id: user.user_id,
      action_url: actionUrl,
      action_label: actionLabel,
      metadata: metadata || {}
    }));
    
    // Insert all notifications
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (insertError) throw insertError;
    
    return {
      success: true,
      count: notifications.length
    };
    
  } catch (error: any) {
    console.error('Error sending notification:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error sending notification'
    };
  }
}

/**
 * Send a notification to a specific user in a tenant
 */
export function sendUserNotification(
  userId: string,
  tenantId: string,
  title: string,
  message: string,
  type: NotificationType = 'info',
  options: Partial<SendNotificationOptions> = {}
) {
  return sendNotification({
    userId,
    tenantId,
    title,
    message,
    type,
    ...options
  });
}

/**
 * Send a notification to all users in a tenant
 */
export function sendTenantNotification(
  tenantId: string,
  title: string,
  message: string,
  type: NotificationType = 'info',
  options: Partial<SendNotificationOptions> = {}
) {
  return sendNotification({
    tenantId,
    title,
    message,
    type,
    ...options
  });
}

/**
 * Send a system notification (for critical alerts)
 */
export function sendSystemNotification(
  title: string,
  message: string,
  options: Partial<SendNotificationOptions> = {}
) {
  return sendNotification({
    tenantId: 'system',
    title,
    message,
    type: options.type || 'info',
    showToast: true,
    ...options
  });
}
