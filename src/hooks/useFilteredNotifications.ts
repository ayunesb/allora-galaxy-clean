
import { useMemo } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { NotificationType } from '@/types/notifications';

interface UseFilteredNotificationsOptions {
  type?: NotificationType | 'all';
  unreadOnly?: boolean;
  limit?: number;
}

export function useFilteredNotifications(options: UseFilteredNotificationsOptions = {}) {
  const { type = 'all', unreadOnly = false, limit } = options;
  const { notifications, loading } = useNotificationsContext();

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];
    
    // Filter by type if not 'all'
    if (type !== 'all') {
      filtered = filtered.filter(notification => notification.type === type);
    }
    
    // Filter by read status if unreadOnly is true
    if (unreadOnly) {
      filtered = filtered.filter(notification => !notification.is_read);
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Apply limit if provided
    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [notifications, type, unreadOnly, limit]);

  return {
    notifications: filteredNotifications,
    loading,
    count: filteredNotifications.length
  };
}

export function useNotificationStats() {
  const { notifications } = useNotificationsContext();
  
  return useMemo(() => {
    const stats = {
      total: notifications.length,
      unread: 0,
      byType: {} as Record<string, number>
    };
    
    notifications.forEach(notification => {
      // Count unread
      if (!notification.is_read) {
        stats.unread++;
      }
      
      // Count by type
      const type = notification.type || 'unknown';
      if (!stats.byType[type]) {
        stats.byType[type] = 0;
      }
      stats.byType[type]++;
    });
    
    return stats;
  }, [notifications]);
}
