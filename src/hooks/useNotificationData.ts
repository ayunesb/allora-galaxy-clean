
import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { Notification, NotificationContent } from '@/types/notifications';

export const useNotificationData = (tabFilter: string | null = null) => {
  const { 
    notifications, 
    loading, 
    error,
    refreshNotifications 
  } = useNotifications();
  
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  // Transform Notification[] to NotificationContent[]
  const transformedNotifications: NotificationContent[] = filteredNotifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.description || '',
    timestamp: notification.created_at,
    read: notification.is_read,
    type: notification.type,
    action_url: notification.action_url,
    action_label: notification.action_label
  }));

  // Filter notifications based on tab selection
  const filterNotifications = useCallback(() => {
    if (!tabFilter || tabFilter === 'all') {
      setFilteredNotifications(notifications);
    } else if (tabFilter === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.is_read));
    } else {
      // Filter by notification type
      setFilteredNotifications(notifications.filter(n => n.type === tabFilter));
    }
  }, [notifications, tabFilter]);

  // Apply filters whenever notifications or tab filter changes
  useEffect(() => {
    filterNotifications();
  }, [notifications, tabFilter, filterNotifications]);

  return {
    notifications: transformedNotifications,
    loading,
    error,
    refresh: refreshNotifications
  };
};
