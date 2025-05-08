
import React from 'react';
import { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterLoading from './NotificationCenterLoading';

export interface NotificationCenterContentProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose?: () => void;
  loading?: boolean;
  onMarkAllAsRead?: () => Promise<void>;
}

const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  onClose,
  loading = false,
  onMarkAllAsRead
}) => {
  if (loading) {
    return <NotificationCenterLoading />;
  }

  if (notifications.length === 0) {
    return <NotificationCenterEmptyState />;
  }

  return (
    <div className="space-y-2 p-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={{
            id: notification.id,
            title: notification.title,
            message: notification.description || '',
            timestamp: notification.created_at,
            read: notification.is_read || false,
            type: notification.type || 'info',
            action_url: notification.action_url,
            action_label: notification.action_label,
          }}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotificationCenterContent;
