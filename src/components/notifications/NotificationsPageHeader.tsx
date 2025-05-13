
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationsPageHeaderProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
  onMarkAllAsRead?: () => Promise<void>;
  unreadCount?: number;
}

export const NotificationsPageHeader: React.FC<NotificationsPageHeaderProps> = ({
  activeFilter,
  onFilterChange,
  onMarkAllAsRead,
  unreadCount = 0
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b">
      <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-full sm:w-auto">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {onMarkAllAsRead && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
          className="mt-4 sm:mt-0"
        >
          Mark all as read
        </Button>
      )}
    </div>
  );
};

export default NotificationsPageHeader;
