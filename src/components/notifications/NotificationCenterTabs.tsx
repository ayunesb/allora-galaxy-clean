
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NotificationContent } from '@/types/notifications';
import NotificationCenterContent from './NotificationCenterContent';

interface NotificationCenterTabsProps {
  notifications: NotificationContent[];
  loading: boolean;
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: Error }>;
  onClose: () => void;
  unreadCount: number;
}

const NotificationCenterTabs: React.FC<NotificationCenterTabsProps> = ({
  notifications,
  loading,
  markAsRead,
  onClose,
  unreadCount
}) => {
  const [tabValue, setTabValue] = useState('all');

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    onClose();
    return { success: true };
  };

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      <div className="px-4 py-2">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="system" className="flex-1">System</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="all" className="max-h-[300px] overflow-y-auto">
        <NotificationCenterContent 
          notifications={notifications} 
          loading={loading} 
          filter="all"
          markAsRead={markAsRead}
        />
      </TabsContent>
      
      <TabsContent value="unread" className="max-h-[300px] overflow-y-auto">
        <NotificationCenterContent 
          notifications={notifications} 
          loading={loading} 
          filter="unread"
          markAsRead={markAsRead}
        />
      </TabsContent>
      
      <TabsContent value="system" className="max-h-[300px] overflow-y-auto">
        <NotificationCenterContent 
          notifications={notifications} 
          loading={loading} 
          filter="system"
          markAsRead={markAsRead}
        />
      </TabsContent>
    </Tabs>
  );
};

export default NotificationCenterTabs;
