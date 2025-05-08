
import React from 'react';
import { format } from 'date-fns';
import { NotificationContent } from '@/types/notifications';
import { Card } from '@/components/ui/card';
import { CheckCircle, Bell, AlertCircle, Info, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NotificationItemProps {
  notification: NotificationContent;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<any>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formattedDate = notification.timestamp
    ? format(new Date(notification.timestamp), 'MMM d, h:mm a')
    : '';

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onMarkAsRead(notification.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(notification.id);
    }
  };

  const cardContent = (
    <div className="flex items-start gap-3 p-3">
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      <div className="flex-grow min-w-0">
        <h4 className="font-medium text-sm">{notification.title}</h4>
        <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{notification.message}</p>
        <div className="text-xs text-muted-foreground mt-2">{formattedDate}</div>
      </div>
      <div className="flex flex-shrink-0 gap-1">
        {!notification.read && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleMarkAsRead}
            title="Mark as read"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground hover:text-destructive" 
            onClick={handleDelete}
            title="Delete notification"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card 
      className={cn(
        "transition-all hover:bg-muted/50 cursor-pointer",
        !notification.read && "border-l-4 border-l-primary"
      )}
    >
      {notification.action_url ? (
        <Link to={notification.action_url}>{cardContent}</Link>
      ) : (
        cardContent
      )}
    </Card>
  );
};

export default NotificationItem;
