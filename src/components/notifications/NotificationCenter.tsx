
import React from 'react';
import { NotificationType } from '@/types/notifications';
import { NotificationCenterContent } from './NotificationCenterContent';
import { NotificationCenterTabs } from './NotificationCenterTabs';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen,
  onClose 
}) => {
  const { 
    notifications,
    unreadCount,
    isLoading, 
    markAllAsRead,
    deleteAll,
    markAsRead,
    deleteNotification
  } = useNotifications();

  // Convert notifications to the expected format
  const convertedNotifications = notifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as NotificationType,
    timestamp: notification.created_at ? new Date(notification.created_at) : new Date(),
    read: !!notification.read_at
  }));

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-background border-l border-border shadow-xl transform transition-transform duration-200 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <NotificationCenterTabs 
          unreadCount={unreadCount}
          onClose={onClose}
          onMarkAllAsRead={markAllAsRead}
          onDeleteAll={deleteAll}
        />
        
        <NotificationCenterContent 
          notifications={convertedNotifications}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      </div>
    </div>
  );
};

export default NotificationCenter;
