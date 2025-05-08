
import React from 'react';
import { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterLoading from './NotificationCenterLoading';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface NotificationCenterContentProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
  onMarkAllAsRead?: () => Promise<void>;
}

const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  loading = false,
  onMarkAllAsRead,
}) => {
  if (loading) {
    return <NotificationCenterLoading />;
  }

  if (notifications.length === 0) {
    return <NotificationCenterEmptyState />;
  }

  return (
    <div className="space-y-2 p-2">
      {onMarkAllAsRead && notifications.some(n => !n.is_read) && (
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
