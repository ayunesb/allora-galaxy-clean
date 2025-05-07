
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationCenterTabListProps {
  unreadCount: number;
}

const NotificationCenterTabList: React.FC<NotificationCenterTabListProps> = ({ unreadCount }) => {
  return (
    <div className="px-4">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="unread">
          Unread
          {unreadCount > 0 && (
            <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">
              {unreadCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>
    </div>
  );
};

export default NotificationCenterTabList;
