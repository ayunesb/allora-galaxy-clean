
import { useCallback } from 'react';
import { useNotifications } from '@/lib/notifications/useNotifications';

export const useNotificationActions = () => {
  const { markAsRead, markAllAsRead, deleteNotification, refreshNotifications } = useNotifications();

  const handleMarkAsRead = useCallback(async (id: string) => {
    await markAsRead(id);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback(async (id: string) => {
    await deleteNotification(id);
  }, [deleteNotification]);

  const handleRefresh = useCallback(async () => {
    await refreshNotifications();
  }, [refreshNotifications]);

  return {
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    refreshNotifications: handleRefresh,
  };
};
