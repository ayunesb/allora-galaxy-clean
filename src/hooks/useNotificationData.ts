
import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { Notification } from '@/types/notifications';

export const useNotificationData = (tabFilter: string | null = null) => {
  const { 
    notifications, 
    loading, 
    error,
    refreshNotifications 
  } = useNotifications();
  
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

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
    notifications: filteredNotifications,
    loading,
    error,
    refresh: refreshNotifications
  };
};
