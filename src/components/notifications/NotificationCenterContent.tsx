
import React from 'react';
import { NotificationContent } from '@/types/notifications';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterLoading from './NotificationCenterLoading';
import { Button } from '@/components/ui/button';
import NotificationCenterTabs from './NotificationCenterTabs';

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
    return <NotificationCenterEmptyState />;
  }

  return (
    <div className="space-y-2">
      {onMarkAllAsRead && unreadCount > 0 && (
        <div className="flex justify-end p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onMarkAllAsRead()}
          >
            Mark all as read
          </Button>
        </div>
      )}
      
      <NotificationCenterTabs 
        value={activeFilter}
        onValueChange={setActiveFilter}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onDelete={onDelete}
      />
    </div>
  );
};

export default NotificationCenterContent;
