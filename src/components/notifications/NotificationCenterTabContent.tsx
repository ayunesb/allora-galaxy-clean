
import React from 'react';
import { NotificationContent } from '@/types/notifications';
import NotificationCenterTabs from './NotificationCenterTabs';

interface NotificationCenterTabContentProps {
  notifications: NotificationContent[];
  markAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  unreadCount: number;
}

const NotificationCenterTabContent: React.FC<NotificationCenterTabContentProps> = ({
  notifications,
  markAsRead,
  onDelete,
  activeFilter,
  setActiveFilter,
  unreadCount
}) => {
  return (
    <NotificationCenterTabs 
      value={activeFilter}
      onValueChange={setActiveFilter}
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onDelete={onDelete}
    />
  );
};

export default NotificationCenterTabContent;
