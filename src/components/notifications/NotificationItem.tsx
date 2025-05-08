
import React from 'react';
import { 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Bell,
  Trash2,
  MailOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationContent } from '@/types/notifications';
import { format, isToday, isYesterday } from 'date-fns';

interface NotificationItemProps {
  notification: NotificationContent;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'system':
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return `Today at ${format(date, 'p')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'p')}`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };
  
  const handleMarkAsRead = async () => {
    await onMarkAsRead(notification.id);
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col p-3 rounded-lg",
        notification.read ? "bg-muted/50" : "bg-card border border-border"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="mt-0.5">{getIcon()}</div>
          <h4 className="font-medium text-sm">{notification.title}</h4>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(notification.timestamp)}
        </span>
      </div>
      
      {notification.message && (
        <p className="mt-1 text-sm text-muted-foreground ml-6">
          {notification.message}
        </p>
      )}
      
      {(notification.action_url && notification.action_label) && (
        <a 
          href={notification.action_url}
          className="text-sm text-primary mt-2 ml-6 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {notification.action_label}
        </a>
      )}
      
      {!notification.read && (
        <div className="flex justify-end gap-2 mt-2">
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 px-2"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Delete</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 px-2"
            onClick={handleMarkAsRead}
          >
            <MailOpen className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Mark as read</span>
          </Button>
        </div>
      )}
      {notification.read && onDelete && (
        <div className="flex justify-end mt-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 px-2"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Delete</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
