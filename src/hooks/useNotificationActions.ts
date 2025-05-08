
import { useCallback } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';

export const useNotificationActions = () => {
  const {
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsContext();

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      const result = await markAsRead(id);
      return result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error as Error };
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const result = await markAllAsRead();
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error as Error };
    }
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback(async (id: string) => {
    try {
      const result = await deleteNotification(id);
      return result;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error as Error };
    }
  }, [deleteNotification]);

  return {
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
  };
};
