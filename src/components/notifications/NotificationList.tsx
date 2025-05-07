
import React from 'react';
import { Loader2 } from 'lucide-react';
import NotificationItem, { NotificationItemType } from './NotificationItem';
import NotificationEmptyState from './NotificationEmptyState';

interface NotificationListProps {
  notifications: NotificationItemType[];
  loading: boolean;
  selectedTab: string;
  filter: string | null;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  selectedTab,
  filter,
  onMarkAsRead,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return <NotificationEmptyState selectedTab={selectedTab} filter={filter} />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
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
