
import { useState, useEffect, useCallback } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { NotificationContent } from '@/types/notifications';

export const useNotificationData = (tabFilter: string | null = null) => {
  const { 
    notifications, 
    loading,
    error,
    refreshNotifications
  } = useNotificationsContext();
  
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationContent[]>([]);

  // Transform Notification[] to NotificationContent[]
  const transformNotifications = useCallback(() => {
    return notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.description || '',
      timestamp: notification.created_at,
      read: notification.is_read || false,
      type: notification.type,
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
      setFilteredNotifications(transformed.filter(n => !n.read));
    } else {
      // Filter by notification type
      setFilteredNotifications(transformed.filter(n => n.type === tabFilter));
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
