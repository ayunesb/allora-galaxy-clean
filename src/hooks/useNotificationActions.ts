
import { useCallback } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { toast } from '@/hooks/use-toast';

export const useNotificationActions = () => {
  const {
    markAsRead: contextMarkAsRead,
    markAllAsRead: contextMarkAllAsRead,
    deleteNotification: contextDeleteNotification,
  } = useNotificationsContext();

  const handleMarkAsRead = useCallback(async (id: string): Promise<void> => {
    try {
      const result = await contextMarkAsRead(id);
      if (!result.success) {
        throw result.error || new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  }, [contextMarkAsRead]);

  const handleMarkAllAsRead = useCallback(async (): Promise<void> => {
    try {
      const result = await contextMarkAllAsRead();
      if (!result.success) {
        throw result.error || new Error('Failed to mark all notifications as read');
      }
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  }, [contextMarkAllAsRead]);

  const handleDeleteNotification = useCallback(async (id: string): Promise<void> => {
    try {
      const result = await contextDeleteNotification(id);
      if (!result.success) {
        throw result.error || new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  }, [contextDeleteNotification]);

  return {
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
  };
};
