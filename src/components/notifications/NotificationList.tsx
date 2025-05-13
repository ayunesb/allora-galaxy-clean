
import React, { useCallback, memo } from 'react';
import { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  filter?: string;
  markAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  filter,
  markAsRead,
  onDelete,
  loading = false
}) => {
  // Memoized handler function for marking notifications as read
  const handleMarkAsRead = useCallback((id: string) => {
    return markAsRead(id);
  }, [markAsRead]);
  
  // Memoized handler function for deleting notifications
  const handleDelete = useCallback((id: string) => {
    return onDelete ? onDelete(id) : Promise.resolve();
  }, [onDelete]);
  
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
        <MemoizedNotificationItem
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
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

// Memoize the NotificationItem component to prevent unnecessary re-renders
const MemoizedNotificationItem = memo(NotificationItem);

export default memo(NotificationList);
