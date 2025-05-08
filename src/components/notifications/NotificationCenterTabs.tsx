
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NotificationContent } from '@/types/notifications';
import NotificationList from './NotificationList';

interface NotificationCenterTabsProps {
  notifications: NotificationContent[];
  onMarkAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  onClose: () => void;
  unreadCount: number;
}

const NotificationCenterTabs: React.FC<NotificationCenterTabsProps> = ({
  notifications,
  onMarkAsRead,
  onClose,
  unreadCount,
  markAllAsRead
}) => {
  const [tabValue, setTabValue] = useState('all');

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
        <NotificationList 
          notifications={notifications} 
          filter="all"
          onMarkAsRead={onMarkAsRead}
          onClose={onClose}
        />
      </TabsContent>
      
      <TabsContent value="unread" className="max-h-[300px] overflow-y-auto">
        <NotificationList 
          notifications={notifications.filter(n => !n.read)} 
          filter="unread"
          onMarkAsRead={onMarkAsRead}
          onClose={onClose}
        />
      </TabsContent>
      
      <TabsContent value="system" className="max-h-[300px] overflow-y-auto">
        <NotificationList 
          notifications={notifications.filter(n => n.type === 'system')} 
          filter="system"
          onMarkAsRead={onMarkAsRead}
          onClose={onClose}
        />
      </TabsContent>
    </Tabs>
  );
};

export default NotificationCenterTabs;
