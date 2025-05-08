
import { useState } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { NotificationCenterHeader } from './NotificationCenterHeader';
import { NotificationCenterTabs } from './NotificationCenterTabs';
import { NotificationCenterFooter } from './NotificationCenterFooter';
import { NotificationCenterEmptyState } from './NotificationCenterEmptyState';
import { NotificationCenterLoading } from './NotificationCenterLoading';
import { Notification } from '@/types/notifications';

interface NotificationCenterContentProps {
  onClose: () => void;
  onMarkAllAsRead: () => Promise<void>;
}

export const NotificationCenterContent = ({ onClose, onMarkAllAsRead }: NotificationCenterContentProps) => {
  const { 
    notifications,
    isLoading,
    markAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotificationsContext();
  
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archive'>('all');

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read_at;
    if (activeTab === 'archive') return !!notification.read_at;
    return true;
  });

  // Handle marking a notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const result = await markAsRead(id);
      if (!result.success && result.error) {
        console.error("Error marking notification as read:", result.error);
      }
      // Return explicitly for void type compatibility
      return;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Return explicitly for void type compatibility
      return;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
  };

  // Handle deleting a notification
  const handleDeleteNotification = async (id: string) => {
    try {
      const result = await deleteNotification(id);
      if (!result.success && result.error) {
        console.error("Error deleting notification:", result.error);
      }
      // Return explicitly for void type compatibility
      return;
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Return explicitly for void type compatibility
      return;
    }
  };

  // Show loading state while fetching notifications
  if (isLoading) {
    return <NotificationCenterLoading />;
  }

  return (
    <div className="flex flex-col h-full">
      <NotificationCenterHeader 
        onMarkAllAsRead={onMarkAllAsRead} 
        onClose={onClose}
      />
      
      <NotificationCenterTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
      />
      
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <NotificationCenterEmptyState />
        ) : (
          <div className="p-4 divide-y divide-border">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`py-3 ${!notification.read_at ? 'bg-accent/20' : ''} hover:bg-accent/10 cursor-pointer px-2 rounded-md -mx-2`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <button 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                  >
                    <span className="sr-only">Delete</span>
                    &times;
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                {notification.action_label && (
                  <div className="mt-2">
                    <button className="text-xs text-primary hover:underline">
                      {notification.action_label}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <NotificationCenterFooter 
        onClearAll={() => clearAllNotifications().then(() => {})}
      />
    </div>
  );
};
