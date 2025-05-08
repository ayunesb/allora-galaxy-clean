
import React from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationContent } from '@/types/notifications';

export interface NotificationItemProps {
  notification: NotificationContent;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<any>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(notification.id);
    }
  };

  // Format the timestamp
  const formattedTime = notification.timestamp
    ? format(new Date(notification.timestamp), 'MMM d, h:mm a')
    : '';

  return (
    <div
      className={`rounded-lg border p-4 transition-all hover:bg-accent/50 ${
        !notification.read ? 'bg-accent/30' : ''
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-medium flex items-center gap-2">
            {notification.title}
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
            {notification.action_url && notification.action_label && (
              <a
                href={notification.action_url}
                className="text-xs font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.action_label}
              </a>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.read && (
              <DropdownMenuItem onClick={handleMarkAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark as read
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NotificationItem;
