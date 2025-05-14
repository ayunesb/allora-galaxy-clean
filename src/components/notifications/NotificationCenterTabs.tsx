
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NotificationContent } from '@/types/notifications';
import NotificationList from './NotificationList';
import { X, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationCenterTabsProps {
  notifications?: NotificationContent[];
  onMarkAsRead?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  unreadCount?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  onClose?: () => void;
  onMarkAllAsRead?: () => Promise<void>;
  onDeleteAll?: () => Promise<void>;
}

const NotificationCenterTabs: React.FC<NotificationCenterTabsProps> = ({
  notifications = [],
  onMarkAsRead,
  onDelete,
  unreadCount = 0,
  value = 'all',
  onValueChange,
  onClose,
  onMarkAllAsRead,
  onDeleteAll
}) => {
  const handleTabChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onMarkAllAsRead && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
          {onDeleteAll && (
            <Button variant="ghost" size="sm" onClick={onDeleteAll}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

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
        
        {notifications && onMarkAsRead && (
          <>
            <TabsContent value="all" className="max-h-[300px] overflow-y-auto px-4">
              <NotificationList 
                notifications={notifications} 
                filter="all"
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            </TabsContent>
            
            <TabsContent value="unread" className="max-h-[300px] overflow-y-auto px-4">
              <NotificationList 
                notifications={notifications.filter(n => !n.read)} 
                filter="unread"
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            </TabsContent>
            
            <TabsContent value="system" className="max-h-[300px] overflow-y-auto px-4">
              <NotificationList 
                notifications={notifications.filter(n => n.type === 'system')} 
                filter="system"
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </>
  );
};

export default NotificationCenterTabs;
