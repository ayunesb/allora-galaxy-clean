
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';

/**
 * Fetches all notifications for a specific user
 * @param userId The ID of the user to fetch notifications for
 * @param limit Maximum number of notifications to retrieve (default 50)
 * @returns Object with data and error properties
 */
export async function fetchUserNotifications(
  userId: string,
  limit: number = 50
): Promise<{ data: Notification[] | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    return { data, error };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { data: null, error };
  }
}

/**
 * Marks a notification as read
 * @param id The ID of the notification to mark as read
 * @param userId The ID of the user who owns the notification
 * @returns Object with success and error properties
 */
export async function markNotificationAsRead(
  id: string,
  userId: string
): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
      
    return { success: !error, error };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
}

/**
 * Marks all notifications for a user as read
 * @param userId The ID of the user whose notifications to mark as read
 * @returns Object with success and error properties
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);
      
    return { success: !error, error };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
}

/**
 * Deletes a notification
 * @param id The ID of the notification to delete
 * @param userId The ID of the user who owns the notification
 * @returns Object with success and error properties
 */
export async function deleteUserNotification(
  id: string,
  userId: string
): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    return { success: !error, error };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error };
  }
}

/**
 * Gets the count of unread notifications for a specific user
 * @param userId The ID of the user to fetch the count for
 * @returns Object with count and error properties
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<{ count: number, error: any }> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);
      
    return { count: count || 0, error };
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return { count: 0, error };
  }
}
