
import React from 'react';
import NotificationItem from './NotificationItem';
import { NotificationContent } from '@/types/notifications';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import { Loader2 } from 'lucide-react';

interface NotificationListProps {
  notifications: NotificationContent[];
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  onNotificationClick?: () => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
  filter?: string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  markAsRead,
  onNotificationClick,
  onDelete,
  loading = false,
  filter = 'all'
}) => {
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <NotificationCenterEmptyState filter={filter} />
    );
  }
  
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
