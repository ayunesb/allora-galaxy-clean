
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Notification } from '@/types/notifications';
import NotificationList from './NotificationList';

interface NotificationTabsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NotificationTabs: React.FC<NotificationTabsProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
}) => {
  const [tabValue, setTabValue] = useState<string>('all');
  
  const unreadNotifications = notifications.filter(n => !n.read_at);
  const readNotifications = notifications.filter(n => n.read_at);
  
  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="mt-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
        <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
        <TabsTrigger value="read">Read ({readNotifications.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <NotificationList
          notifications={notifications}
          filter="all"
          markAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      </TabsContent>
      
      <TabsContent value="unread">
        <NotificationList
          notifications={unreadNotifications}
          filter="unread"
          markAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      </TabsContent>
      
      <TabsContent value="read">
        <NotificationList
          notifications={readNotifications}
          filter="read"
          markAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      </TabsContent>
    </Tabs>
  );
};

export default NotificationTabs;
