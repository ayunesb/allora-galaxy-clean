
import { useState, useEffect, useCallback } from 'react';
import { NotificationContent } from '@/types/notifications';
import { useNotifications } from '@/lib/notifications/useNotifications';

export interface UseNotificationDataResult {
  notifications: NotificationContent[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useNotificationData = (filter = 'all'): UseNotificationDataResult => {
  const {
    notifications: allNotifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications
  } = useNotifications();
  
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationContent[]>([]);

  // Apply filters to notifications
  useEffect(() => {
    if (!allNotifications) {
      setFilteredNotifications([]);
      return;
    }

    let result = [...allNotifications];
    
    // Convert database notifications to UI-ready format
    const mappedNotifications: NotificationContent[] = result.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.description || '',
      timestamp: notification.created_at,
      read: notification.is_read || false,
      type: notification.type,
      action_url: notification.action_url,
      action_label: notification.action_label,
      metadata: notification.metadata,
    }));
    
    // Apply filter
    if (filter === 'unread') {
      setFilteredNotifications(mappedNotifications.filter(n => !n.read));
    } else if (filter === 'system') {
      setFilteredNotifications(mappedNotifications.filter(n => n.type === 'system'));
    } else {
      setFilteredNotifications(mappedNotifications);
    }
  }, [allNotifications, filter]);

  // Wrap refresh function to match expected Promise<void> return type
  const refresh = useCallback(async (): Promise<void> => {
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [refreshNotifications]);

  return {
    notifications: filteredNotifications,
    unreadCount,
    isLoading,
    error,
    refresh
  };
};
