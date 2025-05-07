
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetch notifications for a specific user and tenant
 * 
 * @param userId The ID of the user
 * @param tenantId The ID of the tenant
 * @returns A Promise that resolves to an object with data and error properties
 */
export async function fetchNotifications(userId: string, tenantId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform data to match our Notification type
    const notifications = data.map(item => ({
      id: item.id,
      title: item.title,
      message: item.description || '',
      type: (item.type || 'info') as 'info' | 'success' | 'warning' | 'error',
      created_at: item.created_at,
      read_at: item.is_read ? item.updated_at : null,
      tenant_id: item.tenant_id,
      user_id: item.user_id,
      action_url: item.action_url,
      action_label: item.action_label
    }));
    
    return { data: notifications, error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: [], error };
  }
}

/**
 * Mark a specific notification as read
 * 
 * @param id The ID of the notification
 * @param userId The ID of the user (for validation)
 * @returns A Promise that resolves to an object with success and error properties
 */
export async function markNotificationAsRead(id: string, userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
}

/**
 * Mark all notifications for a user and tenant as read
 * 
 * @param userId The ID of the user
 * @param tenantId The ID of the tenant
 * @returns A Promise that resolves to an object with success and error properties
 */
export async function markAllNotificationsAsRead(userId: string, tenantId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
}

/**
 * Delete a specific notification
 * 
 * @param id The ID of the notification
 * @param userId The ID of the user (for validation)
 * @returns A Promise that resolves to an object with success and error properties
 */
export async function deleteNotification(id: string, userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error };
  }
}

/**
 * Create a new notification
 * 
 * @param notification The notification data
 * @returns A Promise that resolves to an object with the created notification or an error
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read_at'>) {
  try {
    const newNotification = {
      id: uuidv4(),
      ...notification,
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(newNotification)
      .select()
      .single();
    
    if (error) throw error;
    
    return { notification: data as unknown as Notification, error: null };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { notification: null, error };
  }
}
