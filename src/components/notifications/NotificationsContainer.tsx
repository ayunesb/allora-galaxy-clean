
import { useState } from 'react';
import { useNotificationData } from '@/hooks/useNotificationData';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import NotificationTabs from './NotificationTabs';
import { NotificationsPageHeader } from './NotificationsPageHeader';
import NotificationEmptyState from './NotificationEmptyState';
import { Notification } from '@/types/notifications';

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

  // Convert to compatible format if needed
  const formattedNotifications: Notification[] = notifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    description: n.message,
    user_id: n.user_id || '',
    tenant_id: n.tenant_id || '',
    created_at: n.timestamp || new Date().toISOString(),
    read_at: n.read ? new Date().toISOString() : null,
    type: n.type || 'info'
  }));

  const unreadCount = formattedNotifications.filter(n => !n.read_at).length;

  // Wrap refresh to match expected Promise<void> return type
  const handleRefresh = async (): Promise<void> => {
    try {
      await refresh();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
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
      
      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : formattedNotifications.length > 0 ? (
        <NotificationTabs 
          selectedTab={selectedTab}
          setSelectedTab={handleTabChange}
          notifications={formattedNotifications}
          markAsRead={markAsRead}
          onDelete={deleteNotification}
          loading={false}
        />
      ) : (
        <NotificationEmptyState 
          filter={selectedTab} 
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default NotificationsContainer;
