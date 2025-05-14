
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface NotificationFiltersProps {
  activeFilter: string;
  unreadCount: number;
  onFilterChange: (filter: string) => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  activeFilter,
  unreadCount,
  onFilterChange,
  onMarkAllAsRead
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
      <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-auto">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-1">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
      </Tabs>

      {onMarkAllAsRead && unreadCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
          Mark all as read
        </Button>
      )}
    </div>
  );
};

export default NotificationFilters;
