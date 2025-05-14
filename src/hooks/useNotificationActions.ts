
import { useCallback } from 'react';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { toast } from '@/components/ui/use-toast';

export interface UseNotificationActionsResult {
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationActions = (): UseNotificationActionsResult => {
  const { markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  const handleMarkAsRead = useCallback(async (id: string): Promise<void> => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  }, [markAsRead]);
  
  const handleMarkAllAsRead = useCallback(async (): Promise<void> => {
    try {
      await markAllAsRead();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  }, [markAllAsRead]);
  
  const handleDeleteNotification = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  }, [deleteNotification]);
  
  return {
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification
  };
};
