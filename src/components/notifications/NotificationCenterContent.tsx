
import React from 'react';
import { Notification, NotificationType } from '@/types/notifications';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterLoading from './NotificationCenterLoading';
import { Button } from '@/components/ui/button';
import NotificationCenterTabs from './NotificationCenterTabs';
import { NotificationContent } from '@/types/notifications';

export interface NotificationCenterContentProps {
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isLoading?: boolean; // Changed from loading to isLoading
  onMarkAllAsRead?: () => Promise<void>;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  notifications,
  markAsRead,
  onDelete,
  isLoading = false, // Changed from loading to isLoading
  onMarkAllAsRead,
  activeFilter,
  setActiveFilter
}) => {
  if (isLoading) {
    return <NotificationCenterLoading />;
  }

  if (notifications.length === 0) {
    return <NotificationCenterEmptyState />;
  }

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Map to UI-ready format
  const notificationItems: NotificationContent[] = notifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.description || '',
    timestamp: notification.created_at,
    read: notification.is_read || false,
    type: notification.type as NotificationType,
    action_url: notification.action_url,
    action_label: notification.action_label,
    metadata: notification.metadata,
  }));

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
        notifications={notificationItems}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onDelete={onDelete}
      />
    </div>
  );
};

export default NotificationCenterContent;
