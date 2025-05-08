
import { useState } from 'react';
import { useNotificationData } from '@/hooks/useNotificationData';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import NotificationTabs from './NotificationTabs';
import { NotificationsPageHeader } from './NotificationsPageHeader';
import NotificationList from './NotificationList';
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
  const { notifications, loading, refresh } = useNotificationData(selectedTab);
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationActions();
  
  // Sync with external filter if provided
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (setExternalFilter) {
      setExternalFilter(tab);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-background rounded-lg border shadow-sm">
      <NotificationsPageHeader
        activeFilter={selectedTab}
        onFilterChange={handleTabChange}
        onMarkAllAsRead={markAllAsRead}
        unreadCount={unreadCount}
      />
      
      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : notifications.length > 0 ? (
        <NotificationList 
          notifications={notifications} 
          onDelete={deleteNotification}
          onMarkAsRead={markAsRead}
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
