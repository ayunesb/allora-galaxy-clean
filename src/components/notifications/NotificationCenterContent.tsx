
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import NotificationList from './NotificationList';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterLoading from './NotificationCenterLoading';
import { useNotificationActions } from '@/hooks/useNotificationActions';

// Define the allowed notification types for proper type checking
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

// This interface is used internally in this component
export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
}

export interface NotificationCenterContentProps {
  notifications: NotificationContent[];
  loading: boolean;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  filter: string;
}

const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  notifications,
  loading,
  markAllAsRead,
  markAsRead,
  filter
}) => {
  // Early return for loading state
  if (loading) {
    return <NotificationCenterLoading />;
  }

  // Filter notifications based on the current tab
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'system') return notification.type === 'system';
    return true;
  });

  // Show empty state when no notifications match the filter
  if (filteredNotifications.length === 0) {
    return <NotificationCenterEmptyState filter={filter} />;
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsContent value="all" className="m-0">
        <NotificationList 
          notifications={filter === 'all' ? filteredNotifications : []} 
          onMarkAsRead={markAsRead}
          loading={false}
          selectedTab="all"
          filter={null}
          onDelete={() => {}}
        />
      </TabsContent>
      
      <TabsContent value="unread" className="m-0">
        <NotificationList 
          notifications={filter === 'unread' ? filteredNotifications : []} 
          onMarkAsRead={markAsRead}
          loading={false}
          selectedTab="unread"
          filter={null}
          onDelete={() => {}}
        />
      </TabsContent>
      
      <TabsContent value="system" className="m-0">
        <NotificationList 
          notifications={filter === 'system' ? filteredNotifications : []} 
          onMarkAsRead={markAsRead}
          loading={false}
          selectedTab="system"
          filter={null}
          onDelete={() => {}}
        />
      </TabsContent>
    </Tabs>
  );
};

export default NotificationCenterContent;
