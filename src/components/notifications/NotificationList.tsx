
import React from 'react';
import { NotificationContent } from '@/types/notifications';
import NotificationItem from './NotificationItem';
import NotificationEmptyState from './NotificationEmptyState';

interface NotificationListProps {
  notifications: NotificationContent[];
  filter: string;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<any>;
  loading?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  filter,
  onMarkAsRead,
  loading,
  onDelete
}) => {
  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading notifications...</div>;
  }
  
  if (notifications.length === 0) {
    return <NotificationEmptyState filter={filter} />;
  }

  return (
    <div className="space-y-3 p-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotificationList;
