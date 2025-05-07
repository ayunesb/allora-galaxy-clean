
import React from 'react';
import { Loader2 } from 'lucide-react';
import { NotificationContent } from '@/types/notifications';
import NotificationItem from './NotificationItem';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import { cn } from '@/lib/utils';

interface NotificationCenterContentProps {
  loading: boolean;
  notifications: NotificationContent[];
  filter: string;
  className?: string;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  loading,
  notifications,
  filter,
  className,
  markAsRead,
  markAllAsRead,
}) => {
  // Filter notifications based on selected tab
  const filteredNotifications = React.useMemo(() => {
    if (filter === 'all') {
      return notifications;
    } else if (filter === 'unread') {
      return notifications.filter((notification) => !notification.read);
    } else if (filter === 'system') {
      return notifications.filter((notification) => notification.type === 'system');
    }
    return notifications;
  }, [notifications, filter]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <NotificationCenterEmptyState
        filter={filter}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-2 p-2", className)}>
      {filteredNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={markAsRead}
        />
      ))}
    </div>
  );
};

export default NotificationCenterContent;
