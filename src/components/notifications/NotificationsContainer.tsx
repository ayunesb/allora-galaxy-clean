
import { useState } from 'react';
import { useNotificationData } from '@/hooks/useNotificationData';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import NotificationTabs from './NotificationTabs';
import { NotificationsPageHeader } from './NotificationsPageHeader';
import NotificationEmptyState from './NotificationEmptyState';

interface NotificationsContainerProps {
  filter?: string | null;
  setFilter?: (filter: string) => void;
}

const NotificationsContainer: React.FC<NotificationsContainerProps> = ({ 
  filter: externalFilter,
  setFilter: setExternalFilter
}) => {
  const [selectedTab, setSelectedTab] = useState(externalFilter || 'all');
  const { notifications, isLoading, refresh, unreadCount } = useNotificationData(selectedTab);
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationActions();
  
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
          notifications={notifications} 
          markAsRead={markAsRead}
          onDelete={deleteNotification}
          isLoading={false}
        />
      ) : (
        <NotificationEmptyState 
          filter={selectedTab} 
          onRefresh={refresh}
        />
      )}
    </div>
  );
};

export default NotificationsContainer;
