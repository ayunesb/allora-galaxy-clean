
import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { Notification } from '@/types/notifications';

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
  const filterNotifications = (filter: string) => {
    switch (filter) {
      case 'all':
        return notifications;
      case 'unread':
        return notifications.filter(notif => !notif.read_at);
      case 'system':
        return notifications.filter(notif => notif.type === 'system');
      default:
        return notifications;
    }
  };

  const getEmptyStateMessage = (filter: string) => {
    switch (filter) {
      case 'all':
        return 'You don\'t have any notifications yet';
      case 'unread':
        return 'You don\'t have any unread notifications';
      case 'system':
        return 'No system notifications';
      default:
        return 'No notifications to show';
    }
  };

  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="px-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
      </div>
      
      {['all', 'unread', 'system'].map((filter) => (
        <TabsContent key={filter} value={filter} className="py-0">
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filterNotifications(filter).length > 0 ? (
              <div>
                {filterNotifications(filter).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={{
                      id: notification.id,
                      title: notification.title,
                      description: notification.message,
                      type: notification.type,
                      isRead: !!notification.read_at,
                      createdAt: notification.created_at,
                      link: notification.action_url,
                      module: notification.type === 'system' ? 'system' : undefined
                    }}
                    onMarkAsRead={markAsRead}
                    onDelete={() => {}} // We'll handle this in the parent component
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{getEmptyStateMessage(filter)}</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default NotificationCenterTabs;
