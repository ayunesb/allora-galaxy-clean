
import React, { useState } from 'react';
import { useNotificationData } from '@/hooks/useNotificationData';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import NotificationTabs from './NotificationTabs';

const NotificationsContainer = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const { notifications, loading } = useNotificationData(selectedTab);
  const { markAsRead, deleteNotification } = useNotificationActions();

  return (
    <div className="container max-w-4xl py-8">
      <NotificationTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        notifications={notifications}
        loading={loading}
        markAsRead={markAsRead}
        onDelete={deleteNotification}
      />
    </div>
  );
};

export default NotificationsContainer;
