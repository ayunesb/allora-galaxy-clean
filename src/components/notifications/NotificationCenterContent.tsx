
import React from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import NotificationCenterHeader from './NotificationCenterHeader';
import NotificationCenterTabs from './NotificationCenterTabs';
import NotificationCenterFooter from './NotificationCenterFooter';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterLoading from './NotificationCenterLoading';
import { NotificationContent } from '@/types/notifications';

interface NotificationCenterContentProps {
  onClose: () => void;
  onMarkAllAsRead: () => Promise<void>;
}

export const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  onClose,
  onMarkAllAsRead
}) => {
  const { notifications, loading, markAsRead } = useNotificationsContext();

  const handleMarkAsRead = async (id: string): Promise<void> => {
    try {
      const result = await markAsRead(id);
      if (!result.success) {
        throw result.error || new Error('Failed to mark notification as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Transform Notification[] to NotificationContent[]
  const transformedNotifications: NotificationContent[] = notifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message || notification.description || '',
    timestamp: notification.created_at,
    read: notification.is_read || false,
    type: notification.type,
    action_url: notification.action_url,
    action_label: notification.action_label
  }));

  return (
    <div className="flex flex-col h-full">
      <NotificationCenterHeader 
        onClose={onClose} 
        markAllAsRead={onMarkAllAsRead}
      />
      
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <NotificationCenterLoading />
        ) : transformedNotifications.length === 0 ? (
          <NotificationCenterEmptyState />
        ) : (
          <NotificationCenterTabs 
            notifications={transformedNotifications} 
            onMarkAsRead={handleMarkAsRead}
            unreadCount={transformedNotifications.filter(n => !n.read).length}
            onClose={onClose}
          />
        )}
      </div>
      
      <NotificationCenterFooter onMarkAllAsRead={onMarkAllAsRead} />
    </div>
  );
};

export default NotificationCenterContent;
