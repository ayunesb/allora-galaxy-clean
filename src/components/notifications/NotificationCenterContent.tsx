
import React from 'react';
import { NotificationContent } from '@/types/notifications';
import NotificationCenterLoading from './NotificationCenterLoading';
import NotificationCenterEmpty from './NotificationCenterEmpty';
import NotificationCenterHeader from './NotificationCenterHeader';
import NotificationCenterTabContent from './NotificationCenterTabContent';

export interface NotificationCenterContentProps {
  notifications: NotificationContent[];
  markAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isLoading?: boolean;
  onMarkAllAsRead?: () => Promise<void>;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  unreadCount: number;
}

const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  notifications,
  markAsRead,
  onDelete,
  isLoading = false,
  onMarkAllAsRead,
  activeFilter,
  setActiveFilter,
  unreadCount
}) => {
  if (isLoading) {
    return <NotificationCenterLoading />;
  }

  if (notifications.length === 0) {
    return <NotificationCenterEmpty />;
  }

  return (
    <div className="space-y-2">
      <NotificationCenterHeader 
        onMarkAllAsRead={onMarkAllAsRead} 
        unreadCount={unreadCount}
      />
      
      <NotificationCenterTabContent
        notifications={notifications}
        markAsRead={markAsRead}
        onDelete={onDelete}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        unreadCount={unreadCount}
      />
    </div>
  );
};

export default NotificationCenterContent;
