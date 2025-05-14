
import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from '@/hooks/use-toast';

export interface UseNotificationCenterOptions {
  showToastOnNew?: boolean;
  autoLoad?: boolean;
  refreshInterval?: number;
}

export const useNotificationCenter = (options: UseNotificationCenterOptions = {}) => {
  const { 
    showToastOnNew = false,
    autoLoad = true,
    refreshInterval = 60000 // 1 minute by default
  } = options;
  
  const {
    notifications,
    unreadCount,
    isLoading: loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications({
    autoLoad,
    refreshInterval,
    showToastOnNew
  });
  
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  
  // Check for new notifications
  useEffect(() => {
    if (showToastOnNew && unreadCount > lastNotificationCount) {
      const newNotifications = unreadCount - lastNotificationCount;
      toast({
        title: `${newNotifications} New Notification${newNotifications > 1 ? 's' : ''}`,
        description: "Click to view your notifications",
        variant: "default"
      });
    }
    
    setLastNotificationCount(unreadCount);
  }, [unreadCount, lastNotificationCount, showToastOnNew]);
  
  // Create utility functions with error handling
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, [markAsRead]);
  
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      toast({
        title: "All notifications marked as read",
        variant: "default"
      });
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Failed to mark all as read",
        description: "Please try again later",
        variant: "destructive"
      });
      return false;
    }
  }, [markAllAsRead]);
  
  const handleDeleteNotification = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }, [deleteNotification]);
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification
  };
};

export default useNotificationCenter;
