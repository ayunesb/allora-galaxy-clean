
import { supabaseWithErrorHandler } from '@/lib/supabase';
import { Notification } from '@/types/notifications';

/**
 * Fetches all notifications for a specific user
 * @param userId The ID of the user to fetch notifications for
 * @param limit Maximum number of notifications to retrieve (default 50)
 * @returns Object with data and error properties
 */
export const fetchUserNotifications = async (
  userId: string,
  limit: number = 50
): Promise<{ data: Notification[] | null, error: any }> => {
  try {
    const { data, error } = await supabaseWithErrorHandler
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
};

/**
 * Marks a notification as read
 * @param id The ID of the notification to mark as read
 * @param userId The ID of the user who owns the notification
 * @returns Object with success and error properties
 */
export const markNotificationAsRead = async (
  id: string,
  userId: string
): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabaseWithErrorHandler
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
      
    return { success: !error, error };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};

/**
 * Marks all notifications for a user as read
 * @param userId The ID of the user whose notifications to mark as read
 * @returns Object with success and error properties
 */
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabaseWithErrorHandler
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);
      
    return { success: !error, error };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
};
