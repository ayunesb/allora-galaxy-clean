import React from 'react';
import { formatRelativeDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { Trash2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { NotificationContent } from '@/types/notifications';

export interface NotificationItemProps {
  notification: NotificationContent;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const handleMarkAsRead = async () => {
    if (!notification.read) {
      try {
        await onMarkAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark notification as read',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await onDelete(notification.id);
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  return (
    <div 
      className={cn(
        "p-4 hover:bg-accent/50 cursor-pointer flex items-start gap-3",
        !notification.read && "bg-accent/20"
      )}
      onClick={handleMarkAsRead}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <Circle className="h-2 w-2 mt-1.5 text-primary flex-shrink-0" fill="currentColor" />
      )}
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-foreground">{notification.title}</h4>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(notification.timestamp)}
          </span>
        </div>
        
        <p className="text-sm text-foreground/80 mt-1">{notification.message}</p>
        
        {notification.action_url && notification.action_label && (
          <a 
            href={notification.action_url} 
            className="text-sm text-primary hover:text-primary/80 mt-2 inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            {notification.action_label}
          </a>
        )}
      </div>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={handleDelete}
        className="h-7 w-7 opacity-50 hover:opacity-100"
      >
        <Trash2 size={16} />
        <span className="sr-only">Delete notification</span>
      </Button>
    </div>
  );
};

export default NotificationItem;
