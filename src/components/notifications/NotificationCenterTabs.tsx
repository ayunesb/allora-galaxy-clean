
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Notification } from '@/types/notifications';
import NotificationList from './NotificationList';

interface NotificationCenterTabsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  unreadCount: number;
  value?: string;
  onValueChange?: (value: string) => void;
  userId: string;
}

const NotificationCenterTabs: React.FC<NotificationCenterTabsProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  unreadCount,
  value = 'all',
  onValueChange,
  userId
}) => {
  const handleTabChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <Tabs value={value} onValueChange={handleTabChange} className="w-full">
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
          onDelete={onDelete}
          userId={userId}
        />
      </TabsContent>
      
      <TabsContent value="unread" className="max-h-[300px] overflow-y-auto">
        <NotificationList 
          notifications={notifications.filter(n => !n.read_at)} 
          filter="unread"
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          userId={userId}
        />
      </TabsContent>
      
      <TabsContent value="system" className="max-h-[300px] overflow-y-auto">
        <NotificationList 
          notifications={notifications.filter(n => n.type === 'system')} 
          filter="system"
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          userId={userId}
        />
      </TabsContent>
    </Tabs>
  );
};

export default NotificationCenterTabs;
