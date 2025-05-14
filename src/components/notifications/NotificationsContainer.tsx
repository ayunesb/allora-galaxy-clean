
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
        onMarkAllAsRead={markAllAsRead}
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
          markAsRead={markAsRead}
          onDelete={deleteNotification}
          isLoading={false}
        />
      ) : (
        <NotificationEmptyState 
          filter={selectedTab} 
          onRefresh={refreshNotifications}
        />
      )}
    </div>
  );
};

export default NotificationsContainer;
