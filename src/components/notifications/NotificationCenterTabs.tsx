
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Notification } from '@/types/notifications';
import NotificationList from './NotificationList';

interface NotificationCenterTabsProps {
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  unreadCount: number;
  value?: string;
  onValueChange?: (value: string) => void;
}

const NotificationCenterTabs: React.FC<NotificationCenterTabsProps> = ({
  notifications,
  markAsRead,
  onDelete,
  unreadCount,
  value = 'all',
  onValueChange,
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
          markAsRead={markAsRead}
          onDelete={onDelete}
        />
      </TabsContent>
      
      <TabsContent value="unread" className="max-h-[300px] overflow-y-auto">
        <NotificationList 
          notifications={notifications.filter(n => !n.read_at)} 
          filter="unread"
          markAsRead={markAsRead}
          onDelete={onDelete}
        />
      </TabsContent>
      
      <TabsContent value="system" className="max-h-[300px] overflow-y-auto">
        <NotificationList 
          notifications={notifications.filter(n => n.type === 'system')} 
          filter="system"
          markAsRead={markAsRead}
          onDelete={onDelete}
        />
      </TabsContent>
    </Tabs>
  );
};

export default NotificationCenterTabs;
