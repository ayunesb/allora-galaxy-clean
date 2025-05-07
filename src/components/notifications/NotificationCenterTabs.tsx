
import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/types/notifications';
import NotificationCenterTabList from './NotificationCenterTabList';
import NotificationCenterContent from './NotificationCenterContent';

// Convert Notification to NotificationContent format expected by NotificationCenterContent
interface NotificationContentMap {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
}

interface NotificationCenterTabsProps {
  loading: boolean;
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  onClose: () => void;
  unreadCount: number;
}

const NotificationCenterTabs: React.FC<NotificationCenterTabsProps> = ({
  loading,
  notifications,
  markAsRead,
  onClose,
  unreadCount
}) => {
  // Map notifications to the format expected by NotificationCenterContent
  const mappedNotifications: NotificationContentMap[] = notifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    description: notification.description || '',
    timestamp: notification.createdAt,
    read: notification.isRead,
    type: notification.type as 'info' | 'success' | 'warning' | 'error' | 'system'
  }));

  return (
    <Tabs defaultValue="all" className="w-full">
      <NotificationCenterTabList unreadCount={unreadCount} />
      
      {['all', 'unread', 'system'].map((filter) => (
        <TabsContent key={filter} value={filter} className="py-0">
          <ScrollArea className="h-[300px]">
            <NotificationCenterContent
              loading={loading}
              notifications={mappedNotifications}
              filter={filter}
              markAsRead={markAsRead}
              markAllAsRead={() => {}}
              onClose={onClose}
            />
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default NotificationCenterTabs;
