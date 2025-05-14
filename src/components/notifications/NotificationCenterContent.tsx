
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BellRing, Check } from 'lucide-react';
import { NotificationContent } from '@/types/notifications';
import NotificationList from './NotificationList';

export interface NotificationCenterContentProps {
  notifications: NotificationContent[];
  unreadCount: number;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDeleteNotification: (id: string) => Promise<void>;
  onClose: () => void;
}

export const NotificationCenterContent: React.FC<NotificationCenterContentProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('all');

  const unreadNotifications = notifications.filter((n) => !n.read);
  const systemNotifications = notifications.filter((n) => n.type === 'system');
  const alertsNotifications = notifications.filter(
    (n) => n.type === 'warning' || n.type === 'error'
  );

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return unreadNotifications;
      case 'system':
        return systemNotifications;
      case 'alerts':
        return alertsNotifications;
      default:
        return notifications;
    }
  };

  return (
    <Card className="border shadow-md w-full z-50">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-md font-medium flex items-center">
          <BellRing className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
              {unreadCount} new
            </span>
          )}
        </CardTitle>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              <span className="text-xs">Mark all read</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 pb-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="system" className="flex-1">
              System
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-1">
              Alerts
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-0">
          <TabsContent value="all" className="m-0">
            <NotificationList
              notifications={notifications}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDeleteNotification}
            />
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <NotificationList
              notifications={unreadNotifications}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDeleteNotification}
            />
          </TabsContent>

          <TabsContent value="system" className="m-0">
            <NotificationList
              notifications={systemNotifications}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDeleteNotification}
            />
          </TabsContent>

          <TabsContent value="alerts" className="m-0">
            <NotificationList
              notifications={alertsNotifications}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDeleteNotification}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
