
import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/context/notifications/useNotifications';
import { Notification, NotificationContent } from '@/types/notifications';

export const useNotificationData = (tabFilter: string | null = null) => {
  const { 
    notifications, 
    loading,
    error,
    refreshNotifications
  } = useNotifications();
  
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationContent[]>([]);

  // Transform Notification[] to NotificationContent[]
  const transformNotifications = useCallback(() => {
    return notifications.map((notification: Notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.description || '',
      timestamp: notification.created_at,
      read: !!notification.is_read || !!notification.read_at,
      type: notification.type as NotificationType,
      action_url: notification.action_url,
      action_label: notification.action_label
    }));
  }, [notifications]);

  // Filter notifications based on tab selection
  const filterNotifications = useCallback(() => {
    const transformed = transformNotifications();
    if (!tabFilter || tabFilter === 'all') {
      setFilteredNotifications(transformed);
    } else if (tabFilter === 'unread') {
      setFilteredNotifications(transformed.filter((n) => !n.read));
    } else {
      // Filter by notification type
      setFilteredNotifications(transformed.filter((n) => n.type === tabFilter));
    }
  }, [notifications, tabFilter, transformNotifications]);

  // Apply filters whenever notifications or tab filter changes
  useEffect(() => {
    filterNotifications();
  }, [notifications, tabFilter, filterNotifications]);

  return {
    notifications: filteredNotifications,
    loading,
    error,
    refresh: refreshNotifications
  };
};
