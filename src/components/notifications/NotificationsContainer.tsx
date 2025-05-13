
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/lib/notifications/useNotifications';
import NotificationsPageHeader from './NotificationsPageHeader';
import NotificationFilters from './NotificationFilters';
import NotificationTabs from './NotificationTabs';
import { Notification } from '@/types/notifications';
import NotificationEmptyState from './NotificationEmptyState';

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
  
  // Apply filters to notifications
  const filteredNotifications = notifications.filter(notification => {
    // Type filter
    if (filter && filter !== 'all' && notification.type !== filter) {
      return false;
    }
    
    // Search filter
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !(notification.message && notification.message.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
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
  
  // Wrap the notification actions to ensure they return Promise<void>
  const markAsRead = async (id: string): Promise<void> => {
    await originalMarkAsRead(id);
  };
  
  const deleteNotification = async (id: string): Promise<void> => {
    await originalDeleteNotification(id);
  };
  
  const handleMarkAllAsRead = async () => {
    await originalMarkAllAsRead();
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
  };
  
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
            onTypeFilterChange={setFilter}
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

export default NotificationsContainer;
