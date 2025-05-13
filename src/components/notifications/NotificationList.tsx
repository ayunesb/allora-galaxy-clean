
import React from 'react';
import { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  userId: string;
  filter?: string;
  onMarkAsRead?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  userId,
  filter,
  onMarkAsRead,
  onDelete,
  loading = false
}) => {
  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading notifications...</div>;
  }
  
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No {filter !== 'all' ? filter + ' ' : ''}notifications found
      </div>
    );
  }
  
  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          userId={userId}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotificationList;
