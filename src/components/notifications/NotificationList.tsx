
import React from 'react';
import NotificationItem from './NotificationItem';
import { NotificationContent } from '@/types/notifications';

interface NotificationListProps {
  notifications: NotificationContent[];
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  onNotificationClick?: () => void;
  onDelete?: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  markAsRead,
  onNotificationClick,
  onDelete
}) => {
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };
  
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotificationList;
