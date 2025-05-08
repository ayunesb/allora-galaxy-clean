
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import NotificationList from './NotificationList';
import { NotificationContent } from '@/types/notifications';

interface NotificationTabsProps {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
  notifications: NotificationContent[];
  loading: boolean;
  filter?: string | null;
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: Error }>;
}

const NotificationTabs: React.FC<NotificationTabsProps> = ({
  selectedTab,
  setSelectedTab,
  notifications,
  loading,
  markAsRead,
  onDelete
}) => {
  const handleMarkAsRead = async (id: string): Promise<void> => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string): Promise<void> => {
    await onDelete(id);
  };

  return (
    <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="all">All Notifications</TabsTrigger>
        <TabsTrigger value="unread">Unread</TabsTrigger>
      </TabsList>
      
      <Card>
        <CardContent className="p-6">
          <NotificationList 
            notifications={notifications} 
            loading={loading} 
            filter={selectedTab}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </Tabs>
  );
};

export default NotificationTabs;
