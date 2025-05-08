
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationContent } from '@/types/notifications';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: NotificationContent[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete
}) => {
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
