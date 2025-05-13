
import React from 'react';
import { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  userId: string;
  filter?: string;
  markAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  userId,
  filter,
  markAsRead,
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
          notification={{
            id: notification.id,
            title: notification.title,
            message: notification.message || notification.description || '',
            timestamp: notification.created_at,
            read: !!notification.read_at,
            type: notification.type as any,
            action_url: notification.action_url,
            action_label: notification.action_label
          }}
          onMarkAsRead={markAsRead}
          onDelete={onDelete || (async () => {})}
        />
      ))}
    </div>
  );
};

export default NotificationList;
