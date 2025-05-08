
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NotificationContent } from '@/types/notifications';
import NotificationList from './NotificationList';

interface NotificationTabsProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  notifications: NotificationContent[];
  loading?: boolean;
  markAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<any>;
}

const NotificationTabs: React.FC<NotificationTabsProps> = ({
  selectedTab,
  setSelectedTab,
  notifications,
  loading,
  markAsRead,
  onDelete
}) => {
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  // Count system notifications
  const systemCount = notifications.filter(n => n.type === 'system').length;

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <div className="border-b px-4 py-2">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="system" className="flex-1">
            System {systemCount > 0 && `(${systemCount})`}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="all" className="max-h-[500px] overflow-y-auto">
        <NotificationList 
          notifications={notifications} 
          filter="all"
          onMarkAsRead={markAsRead}
          onDelete={onDelete}
          loading={loading}
        />
      </TabsContent>
      
      <TabsContent value="unread" className="max-h-[500px] overflow-y-auto">
        <NotificationList 
          notifications={notifications.filter(n => !n.read)} 
          filter="unread"
          onMarkAsRead={markAsRead}
          onDelete={onDelete}
          loading={loading}
        />
      </TabsContent>
      
      <TabsContent value="system" className="max-h-[500px] overflow-y-auto">
        <NotificationList 
          notifications={notifications.filter(n => n.type === 'system')} 
          filter="system"
          onMarkAsRead={markAsRead}
          onDelete={onDelete}
          loading={loading}
        />
      </TabsContent>
    </Tabs>
  );
};

export default NotificationTabs;
