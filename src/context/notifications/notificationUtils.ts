
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Notification } from './types';

/**
 * Fetch notifications for a specific user
 * @param userId User ID to fetch notifications for
 * @returns Notifications array and any error
 */
export const fetchUserNotifications = async (userId: string): Promise<{
  data: Notification[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return { data: null, error };
  }
};

/**
 * Mark a notification as read
 * @param id Notification ID
 * @param userId User ID
 * @returns Success status and any error
 */
export const markNotificationAsRead = async (id: string, userId: string): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    toast({
      title: 'Error',
      description: 'Failed to update notification',
      variant: 'destructive',
    });
    return { success: false, error };
  }
};

/**
 * Mark all notifications as read for a user
 * @param userId User ID
 * @returns Success status and any error
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    toast({
      title: 'Error',
      description: 'Failed to update notifications',
      variant: 'destructive',
    });
    return { success: false, error };
  }
};

/**
 * Delete a notification
 * @param id Notification ID
 * @param userId User ID
 * @returns Success status and any error
 */
export const deleteUserNotification = async (id: string, userId: string): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete notification',
      variant: 'destructive',
    });
    return { success: false, error };
  }
};
