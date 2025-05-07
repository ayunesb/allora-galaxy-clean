
import React from 'react';
import { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterLoading from './NotificationCenterLoading';

interface NotificationCenterContentProps {
  loading: boolean;
  notifications: Notification[];
  filter: string;
  markAsRead: (id: string) => Promise<void>;
  onClose?: () => void;
}

const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  loading,
  notifications,
  filter,
  markAsRead,
  onClose
}) => {
  const filterNotifications = (filter: string) => {
    switch (filter) {
      case 'all':
        return notifications;
      case 'unread':
        return notifications.filter(notif => !notif.read_at);
      case 'system':
        return notifications.filter(notif => notif.type.toLowerCase() === 'system');
      default:
        return notifications;
    }
  };

  if (loading) {
    return <NotificationCenterLoading />;
  }

  const filteredNotifications = filterNotifications(filter);

  if (filteredNotifications.length === 0) {
    return <NotificationCenterEmptyState filter={filter} />;
  }

  return (
    <div>
      {filteredNotifications.map((notification) => (
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
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default NotificationCenterContent;
