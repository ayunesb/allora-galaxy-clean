
import React, { useState } from 'react';
import { useNotificationData } from '@/hooks/useNotificationData';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import NotificationsPageHeader from './NotificationsPageHeader';
import NotificationTabs from './NotificationTabs';

interface NotificationsContainerProps {
  filter: string | null;
  setFilter: (filter: string | null) => void;
}

const NotificationsContainer: React.FC<NotificationsContainerProps> = ({ filter, setFilter }) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const { notifications, loading, refresh } = useNotificationData(selectedTab);
  const { markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotificationActions();

  const handleMarkAsRead = async (id: string) => {
    const result = await markAsRead(id);
    if (result.success) {
      // Update local state
      await refresh();
    }
    return result;
  };

  const handleDeleteNotification = async (id: string) => {
    const result = await deleteNotification(id);
    if (result.success) {
      // Refresh notifications
      await refresh();
    }
    return result;
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Refresh notifications
    await refresh();
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications(filter, selectedTab);
    // Refresh notifications
    await refresh();
  };

  return (
    <>
      <NotificationsPageHeader
        filter={filter}
        setFilter={setFilter}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteAll={handleDeleteAll}
      />
      
      <NotificationTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        notifications={notifications}
        loading={loading}
        filter={filter}
        markAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
      />
    </>
  );
};

export default NotificationsContainer;
