
import React from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { Button } from '@/components/ui/button';
import NotificationCenterHeader from './NotificationCenterHeader';
import NotificationCenterTabs from './NotificationCenterTabs';
import NotificationCenterFooter from './NotificationCenterFooter';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterLoading from './NotificationCenterLoading';

interface NotificationCenterContentProps {
  onClose: () => void;
  onMarkAllAsRead: () => Promise<void>;
}

export const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  onClose,
  onMarkAllAsRead
}) => {
  const { notifications, loading, error, markAsRead } = useNotificationsContext();

  const handleMarkAsRead = async (id: string): Promise<void> => {
    try {
      const result = await markAsRead(id);
      if (!result.success) {
        throw result.error || new Error('Failed to mark notification as read');
      }
      return;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <NotificationCenterHeader onClose={onClose} />
      
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <NotificationCenterLoading />
        ) : notifications.length === 0 ? (
          <NotificationCenterEmptyState />
        ) : (
          <NotificationCenterTabs 
            notifications={notifications} 
            onMarkAsRead={handleMarkAsRead}
          />
        )}
      </div>
      
      <NotificationCenterFooter onMarkAllAsRead={onMarkAllAsRead} />
    </div>
  );
};

export default NotificationCenterContent;
