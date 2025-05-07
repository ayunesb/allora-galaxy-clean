
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/types/notifications';
import NotificationCenterLoading from './NotificationCenterLoading';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationList from './NotificationList';

interface NotificationCenterTabsProps {
  loading: boolean;
  notifications: Notification[];
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  markAllAsRead: () => Promise<void>;
  onClose: () => void;
  unreadCount: number;
}

const NotificationCenterTabs: React.FC<NotificationCenterTabsProps> = ({
  loading,
  notifications,
  markAsRead,
  markAllAsRead,
  onClose,
  unreadCount,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Filter notifications based on the active tab
  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(notification => !notification.read_at)
    : notifications;

  if (loading) {
    return <NotificationCenterLoading />;
  }

  return (
    <Tabs 
      defaultValue="all" 
      className="flex-1 overflow-hidden"
      onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}
    >
      <div className="border-b px-2">
        <TabsList className="h-9 w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="h-9 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            className="h-9 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        <TabsContent value="all" className="m-0 py-2">
          {notifications.length === 0 ? (
            <NotificationCenterEmptyState />
          ) : (
            <NotificationList
              notifications={filteredNotifications}
              markAsRead={markAsRead}
              onNotificationClick={onClose}
            />
          )}
        </TabsContent>
        
        <TabsContent value="unread" className="m-0 py-2">
          {unreadCount === 0 ? (
            <NotificationCenterEmptyState message="You have no unread notifications." />
          ) : (
            <NotificationList
              notifications={filteredNotifications}
              markAsRead={markAsRead}
              onNotificationClick={onClose}
            />
          )}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};

export default NotificationCenterTabs;
