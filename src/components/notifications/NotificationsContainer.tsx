
import { useState } from 'react';
import { useNotificationData } from '@/hooks/useNotificationData';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import NotificationTabs from './NotificationTabs';

interface NotificationsContainerProps {
  filter?: string | null;
  setFilter?: (filter: string) => void;
}

const NotificationsContainer: React.FC<NotificationsContainerProps> = ({ 
  filter: externalFilter,
  setFilter: setExternalFilter
}) => {
  const [selectedTab, setSelectedTab] = useState(externalFilter || 'all');
  const { notifications, loading } = useNotificationData(selectedTab);
  const { markAsRead, deleteNotification } = useNotificationActions();
  
  // Sync with external filter if provided
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (setExternalFilter) {
      setExternalFilter(tab);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <NotificationTabs
        selectedTab={selectedTab}
        setSelectedTab={handleTabChange}
        notifications={notifications}
        loading={loading}
        markAsRead={markAsRead}
        onDelete={deleteNotification}
      />
    </div>
  );
};

export default NotificationsContainer;
