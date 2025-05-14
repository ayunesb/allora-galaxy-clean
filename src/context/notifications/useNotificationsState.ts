
import { useState, useCallback } from 'react';
import { Notification } from './types';
import { 
  fetchUserNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  getUnreadNotificationCount
} from './notificationUtils';

export function useNotificationsState(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch notifications for the user
  const refreshNotifications = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return { success: false };
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch notifications
      const { data, error: fetchError } = await fetchUserNotifications(userId);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Process notifications
      const processedNotifications = (data || []).map(notification => ({
        ...notification,
        is_read: !!notification.read_at
      }));

      setNotifications(processedNotifications);

      // Get unread count
      const { count } = await getUnreadNotificationCount(userId);
      setUnreadCount(count);

      return { success: true };
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return { success: false };

    try {
      // Update in database
      const { success, error: apiError } = await markNotificationAsRead(id, userId);

      if (!success) {
        throw new Error(apiError?.message || 'Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      return { success: true };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { success: false, error: err };
    }
  }, [userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return { success: false };

    try {
      // Update in database
      const { success, error: apiError } = await markAllNotificationsAsRead(userId);

      if (!success) {
        throw new Error(apiError?.message || 'Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      
      // Update unread count
      setUnreadCount(0);

      return { success: true };
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return { success: false, error: err };
    }
  }, [userId]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!userId) return { success: false };

    try {
      // Update in database
      const { success, error: apiError } = await deleteUserNotification(id, userId);

      if (!success) {
        throw new Error(apiError?.message || 'Failed to delete notification');
      }

      // Update local state
      const notificationToRemove = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Update unread count if needed
      if (notificationToRemove && !notificationToRemove.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      return { success: true };
    } catch (err) {
      console.error('Error deleting notification:', err);
      return { success: false, error: err };
    }
  }, [userId, notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setNotifications,
    setUnreadCount
  };
}
