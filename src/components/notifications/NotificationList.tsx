
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationContent } from '@/types/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: NotificationContent[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  filter?: string;
  isLoading?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete = async () => {},
  filter,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        <p>No {filter !== 'all' ? filter : ''} notifications</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[500px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationList;
