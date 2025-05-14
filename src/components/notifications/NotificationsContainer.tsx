
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationTabs from './NotificationTabs';
import { NotificationsPageHeader } from './NotificationsPageHeader';
import NotificationEmptyState from './NotificationEmptyState';
import { convertToNotificationContent } from '@/types/notifications';

interface NotificationsContainerProps {
  filter?: string | null;
  setFilter?: (filter: string) => void;
}

const NotificationsContainer: React.FC<NotificationsContainerProps> = ({ 
  filter: externalFilter,
  setFilter: setExternalFilter
}) => {
  const [selectedTab, setSelectedTab] = useState(externalFilter || 'all');
  const { 
    notifications, 
    isLoading, 
    refreshNotifications,
    unreadCount,
    markAllAsRead, 
    markAsRead, 
    deleteNotification
  } = useNotifications();
  
  // Create wrapper functions that void the Promise return type
  const handleMarkAsRead = async (id: string): Promise<void> => {
    await markAsRead(id);
  };
  
  const handleMarkAllAsRead = async (): Promise<void> => {
    await markAllAsRead();
  };
  
  const handleDeleteNotification = async (id: string): Promise<void> => {
    await deleteNotification(id);
  };
  
  const handleRefreshNotifications = async (): Promise<void> => {
    await refreshNotifications();
  };
  
  // Convert notifications to the expected format
  const convertedNotifications = notifications.map(notification => convertToNotificationContent(notification));
  
  // Sync with external filter if provided
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (setExternalFilter) {
      setExternalFilter(tab);
    }
  };

  return (
    <div className="bg-background rounded-lg border shadow-sm">
      <NotificationsPageHeader
        activeFilter={selectedTab}
        onFilterChange={handleTabChange}
        onMarkAllAsRead={handleMarkAllAsRead}
        unreadCount={unreadCount}
      />
      
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : notifications.length > 0 ? (
        <NotificationTabs 
          selectedTab={selectedTab}
          setSelectedTab={handleTabChange}
          notifications={convertedNotifications} 
          markAsRead={handleMarkAsRead}
          onDelete={handleDeleteNotification}
          isLoading={false}
        />
      ) : (
        <NotificationEmptyState 
          filter={selectedTab} 
          onRefresh={handleRefreshNotifications}
        />
      )}
    </div>
  );
};

export default NotificationsContainer;
