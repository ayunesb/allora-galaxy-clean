
import { useNotifications } from '@/lib/notifications/useNotifications';
import { toast } from '@/components/ui/use-toast';

export const useNotificationActions = () => {
  const { 
    markAsRead: markNotificationAsRead, 
    markAllAsRead: markAllNotificationsAsRead, 
    deleteNotification: deleteOneNotification, 
    deleteAll: deleteAllNotificationsFromDB 
  } = useNotifications();

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
      return { success: false, error: error as Error };
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
      return { success: false, error: error as Error };
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteOneNotification(id);
      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
      return { success: false, error: error as Error };
    }
  };

  const deleteAllNotifications = async (filter: string | null, tab: string) => {
    try {
      await deleteAllNotificationsFromDB(filter, tab === 'unread');
      toast({
        title: "Success",
        description: "All notifications deleted",
      });
      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete all notifications",
        variant: "destructive"
      });
      return { success: false, error: error as Error };
    }
  };

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};
