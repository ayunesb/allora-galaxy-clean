
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NotificationCenterHeaderProps {
  unreadCount?: number;
  onMarkAllAsRead?: () => Promise<void>;
  isMarking?: boolean;
  onClose?: () => void;
}

const NotificationCenterHeader: React.FC<NotificationCenterHeaderProps> = ({
  unreadCount = 0,
  onMarkAllAsRead,
  isMarking = false,
  onClose
}) => {
  return (
    <div className="p-4 border-b sticky top-0 bg-background z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={isMarking}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {unreadCount > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          You have {unreadCount} unread notifications
        </div>
      )}
      <Separator className="mt-4" />
    </div>
  );
};

export default NotificationCenterHeader;
