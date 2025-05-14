
import React from 'react';
import { Button } from '@/components/ui/button';

interface NotificationCenterHeaderProps {
  onMarkAllAsRead?: () => Promise<void>;
  unreadCount: number;
}

const NotificationCenterHeader: React.FC<NotificationCenterHeaderProps> = ({
  onMarkAllAsRead,
  unreadCount
}) => {
  if (!onMarkAllAsRead || unreadCount === 0) {
    return null;
  }

  return (
    <div className="flex justify-end p-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onMarkAllAsRead()}
      >
        Mark all as read
      </Button>
    </div>
  );
};

export default NotificationCenterHeader;
