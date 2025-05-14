
import { useState, useMemo } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notifications';

type FilterType = 'all' | 'unread' | 'read';

export const useFilteredNotifications = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, refreshNotifications } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];
    
    // Apply read/unread filter
    if (filter === 'unread') {
      filtered = filtered.filter(notification => !notification.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter(notification => notification.is_read);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        notification => 
          notification.title.toLowerCase().includes(lowerSearchTerm) || 
          notification.message.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return filtered;
  }, [notifications, filter, searchTerm]);

  return {
    notifications: filteredNotifications,
    unreadCount,
    isLoading,
    filter,
    searchTerm,
    setFilter,
    setSearchTerm,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
};

export default useFilteredNotifications;
