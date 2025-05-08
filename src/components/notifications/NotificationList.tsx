
import React from 'react';
import { NotificationContent } from '@/types/notifications';
import NotificationItem from './NotificationItem';
import NotificationEmptyState from './NotificationEmptyState';

interface NotificationListProps {
  notifications: NotificationContent[];
  filter: string;
  onMarkAsRead: (id: string) => Promise<void>;
  onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  filter,
  onMarkAsRead,
  onClose
}) => {
  if (notifications.length === 0) {
    return <NotificationEmptyState filter={filter} />;
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default NotificationList;
