
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/lib/notifications/useNotifications';
import NotificationsPageHeader from './NotificationsPageHeader';
import NotificationFilters from './NotificationFilters';
import NotificationTabs from './NotificationTabs';
import { Notification } from '@/types/notifications';
import NotificationEmptyState from './NotificationEmptyState';
import { useDebounce } from '@/hooks/useDebounce';

interface NotificationsContainerProps {
  filter: string | null;
  setFilter: (value: string) => void;
}

const NotificationsContainer: React.FC<NotificationsContainerProps> = ({ filter, setFilter }) => {
  const { 
    notifications, 
    markAsRead: originalMarkAsRead,
    markAllAsRead: originalMarkAllAsRead,
    deleteNotification: originalDeleteNotification,
    loading,
    refreshNotifications
  } = useNotifications();
  
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Apply filters to notifications with memoization
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Type filter
      if (filter && filter !== 'all' && notification.type !== filter) {
        return false;
      }
      
      // Search filter with debounced value
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const titleMatch = notification.title?.toLowerCase().includes(searchLower);
        const messageMatch = notification.message?.toLowerCase().includes(searchLower) || false;
        
        if (!titleMatch && !messageMatch) {
          return false;
        }
      }
      
      // Time filter
      if (timeFilter !== 'all') {
        const notificationDate = new Date(notification.created_at);
        const now = new Date();
        
        switch (timeFilter) {
          case 'today':
            if (notificationDate.toDateString() !== now.toDateString()) {
              return false;
            }
            break;
          case 'week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            if (notificationDate < oneWeekAgo) {
              return false;
            }
            break;
          case 'month':
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            if (notificationDate < oneMonthAgo) {
              return false;
            }
            break;
        }
      }
      
      return true;
    });
  }, [notifications, filter, debouncedSearchQuery, timeFilter]);
  
  // Wrap notification actions with useCallback
  const markAsRead = useCallback(async (id: string): Promise<void> => {
    await originalMarkAsRead(id);
  }, [originalMarkAsRead]);
  
  const deleteNotification = useCallback(async (id: string): Promise<void> => {
    await originalDeleteNotification(id);
  }, [originalDeleteNotification]);
  
  const handleMarkAllAsRead = useCallback(async () => {
    await originalMarkAllAsRead();
  }, [originalMarkAllAsRead]);
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  const handleTimeFilterChange = useCallback((value: string) => {
    setTimeFilter(value);
  }, []);
  
  const memoizedSetFilter = useCallback((newFilter: string) => {
    setFilter(newFilter);
  }, [setFilter]);
  
  return (
    <div className="space-y-6">
      <NotificationsPageHeader 
        totalCount={notifications.length} 
        onMarkAllAsRead={handleMarkAllAsRead}
      />
      
      <Card>
        <CardContent className="p-6">
          <NotificationFilters
            onSearch={handleSearch}
            searchQuery={searchQuery}
            typeFilter={filter || 'all'}
            onTypeFilterChange={memoizedSetFilter}
            timeFilter={timeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            onRefresh={refreshNotifications}
            isLoading={loading}
          />
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <NotificationEmptyState />
          ) : (
            <NotificationTabs
              notifications={filteredNotifications as Notification[]}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(NotificationsContainer);
