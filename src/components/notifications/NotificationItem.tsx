
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NotificationContent } from '@/types/notifications';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Info, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: NotificationContent;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

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

  const handleActionClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const formattedDate = (() => {
    try {
      const date = new Date(notification.timestamp);
      return format(date, 'MMM d, h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return notification.timestamp;
    }
  })();

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent/50",
        !notification.read && "border-l-4 border-l-primary"
      )}
      onClick={handleMarkAsRead}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="pt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <div className="font-medium leading-tight">
              {notification.title}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </div>
            
            {notification.action_url && notification.action_label && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto mt-1 text-sm flex items-center"
                onClick={handleActionClick}
                asChild
              >
                <a 
                  href={notification.action_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {notification.action_label} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
            
            <div className="text-xs text-muted-foreground mt-1">
              {formattedDate}
            </div>
          </div>
          
          <div className="flex gap-1">
            {!notification.read && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6"
                onClick={handleMarkAsRead}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="sr-only">Mark as read</span>
              </Button>
            )}
            
            {onDelete && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-destructive"
                onClick={handleDelete}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;
