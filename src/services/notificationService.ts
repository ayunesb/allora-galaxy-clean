
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Interface for notification filters
 */
export interface NotificationFilters {
  tenant_id?: string;
  user_id?: string;
  is_read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

/**
 * Interface for notification creation
 */
export interface NotificationCreateInput {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  tenant_id: string;
  user_id: string;
  action_url?: string;
  action_label?: string;
}

/**
 * Fetch notifications with optional filtering
 * @param filters Optional filters to apply
 * @returns Promise resolving to array of Notification objects
 */
export async function fetchNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    
    if (filters.is_read !== undefined) {
      query = query.eq('read_at', filters.is_read ? 'not.is.null' : 'is.null');
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    
    // Transform data to match our Notification type
    const notifications = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      message: item.message || '',
      type: (item.type || 'info') as 'info' | 'success' | 'warning' | 'error',
      created_at: item.created_at,
      read_at: item.read_at || undefined,
      tenant_id: item.tenant_id,
      user_id: item.user_id,
      action_url: item.action_url,
      action_label: item.action_label
    }));
    
    return notifications;
    
  } catch (err: any) {
    console.error('Error in fetchNotifications:', err);
    return [];
  }
}

/**
 * Mark a notification as read
 * @param id Notification ID
 * @param userId User ID for validation
 * @returns Promise resolving to success status
 */
export async function markNotificationAsRead(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        read_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
    
    return true;
    
  } catch (err: any) {
    console.error('Error in markNotificationAsRead:', err);
    // Log the error
    await logSystemEvent(
      'notification',
      'error',
      { message: 'Failed to mark notification as read', notification_id: id, error: err.message }
    );
    return false;
  }
}

/**
 * Mark all notifications for a user as read
 * @param userId User ID
 * @param tenantId Tenant ID
 * @returns Promise resolving to success status
 */
export async function markAllNotificationsAsRead(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        read_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .is('read_at', null);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
    
    // Log the action
    await logSystemEvent(
      'notification',
      'mark_all_read',
      { user_id: userId },
      tenantId
    );
    
    return true;
    
  } catch (err: any) {
    console.error('Error in markAllNotificationsAsRead:', err);
    // Log the error
    await logSystemEvent(
      'notification',
      'error',
      { message: 'Failed to mark all notifications as read', user_id: userId, error: err.message },
      tenantId
    );
    return false;
  }
}

/**
 * Create a new notification
 * @param notification Notification data
 * @returns Promise resolving to created Notification or null
 */
export async function createNotification(
  notification: NotificationCreateInput
): Promise<Notification | null> {
  try {
    const newNotification = {
      id: uuidv4(),
      ...notification,
      created_at: new Date().toISOString(),
      read_at: null
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(newNotification)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    // Format to match our Notification type
    const formattedNotification: Notification = {
      id: data.id,
      title: data.title,
      message: data.message || '',
      type: (data.type || 'info') as 'info' | 'success' | 'warning' | 'error',
      created_at: data.created_at,
      read_at: undefined,
      tenant_id: data.tenant_id,
      user_id: data.user_id,
      action_url: data.action_url,
      action_label: data.action_label
    };
    
    return formattedNotification;
    
  } catch (err: any) {
    console.error('Error in createNotification:', err);
    // Log the error
    await logSystemEvent(
      'notification',
      'error',
      { message: 'Failed to create notification', error: err.message },
      notification.tenant_id
    );
    return null;
  }
}

/**
 * Delete a notification
 * @param id Notification ID
 * @param userId User ID for validation
 * @returns Promise resolving to success status
 */
export async function deleteNotification(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
    
    return true;
    
  } catch (err: any) {
    console.error('Error in deleteNotification:', err);
    // Log the error
    await logSystemEvent(
      'notification',
      'error',
      { message: 'Failed to delete notification', notification_id: id, error: err.message }
    );
    return false;
  }
}

/**
 * Custom hook to fetch notifications with React Query
 * @param filters Optional filters to apply
 * @returns Query result object
 */
export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => fetchNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Custom hook to mark a notification as read with React Query
 * @returns Mutation result object
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      markNotificationAsRead(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', { user_id: variables.userId }] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Custom hook to mark all notifications as read with React Query
 * @returns Mutation result object
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, tenantId }: { userId: string; tenantId: string }) => 
      markAllNotificationsAsRead(userId, tenantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['notifications', { user_id: variables.userId, tenant_id: variables.tenantId }] 
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Custom hook to create a notification with React Query
 * @returns Mutation result object
 */
export function useCreateNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createNotification,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ 
          queryKey: ['notifications', { user_id: data.user_id, tenant_id: data.tenant_id }] 
        });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    },
  });
}

/**
 * Custom hook to delete a notification with React Query
 * @returns Mutation result object
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      deleteNotification(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', { user_id: variables.userId }] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
