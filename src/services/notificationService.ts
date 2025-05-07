
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/context/NotificationsContext';

/**
 * Fetch notifications for a user in a specific tenant
 */
export const fetchNotifications = async (userId: string, tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return { data: null, error: err };
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (id: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error marking notification as read:', err);
    return { success: false, error: err };
  }
};

/**
 * Mark all notifications as read for a user in a tenant
 */
export const markAllNotificationsAsRead = async (userId: string, tenantId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .is('read_at', null);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error marking all notifications as read:', err);
    return { success: false, error: err };
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error deleting notification:', err);
    return { success: false, error: err };
  }
};

/**
 * Setup realtime subscription for new notifications
 */
export const subscribeToNotifications = (tenantId: string, userId: string, onNewNotification: (notification: any) => void) => {
  const channel = supabase.realtime
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `tenant_id=eq.${tenantId} AND user_id=eq.${userId}`
    }, (payload) => {
      onNewNotification(payload.new);
    })
    .subscribe();
  
  return channel;
};
