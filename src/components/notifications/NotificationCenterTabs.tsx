
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
  return (
    <Tabs defaultValue="all" className="w-full">
      <NotificationCenterTabList unreadCount={unreadCount} />
      
      {['all', 'unread', 'system'].map((filter) => (
        <TabsContent key={filter} value={filter} className="py-0">
          <ScrollArea className="h-[300px]">
            <NotificationCenterContent
              loading={loading}
              notifications={notifications}
              filter={filter}
              markAsRead={markAsRead}
              onClose={onClose}
            />
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default NotificationCenterTabs;
