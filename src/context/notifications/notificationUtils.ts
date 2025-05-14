
import { supabase } from '@/lib/supabase';
import { Notification } from './types';

// Function to fetch notifications for a user
export async function fetchUserNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    return { data, error };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error };
  }
}

// Function to mark a notification as read
export async function markNotificationAsRead(id: string, userId: string) {
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

// Function to mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
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

// Function to delete a notification
export async function deleteUserNotification(id: string, userId: string) {
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

// Function to get unread notification count
export async function getUnreadNotificationCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);
      
    return { count: count || 0, error };
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return { count: 0, error };
  }
}

// Function to create a notification
export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read_at' | 'is_read'>) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    return { data, error };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { data: null, error };
  }
}
