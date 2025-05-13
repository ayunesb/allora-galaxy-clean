
import React from 'react';
import { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  userId: string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  userId
}) => {
  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          userId={userId}
        />
      ))}
    </div>
  );
};

export default NotificationList;
