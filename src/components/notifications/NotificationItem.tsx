
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X, CheckCircle, AlertTriangle, Info, Bell } from "lucide-react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Notification, useNotifications } from '@/context/NotificationsContext';

interface NotificationItemProps {
  notification: Notification;
  onOpenChange?: (open: boolean) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onOpenChange 
}) => {
  const { markAsRead, deleteNotification } = useNotifications();
  
  const handleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };
  
  const handleClick = async () => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      if (onOpenChange) {
        onOpenChange(false);
      }
      window.location.href = notification.action_url;
    }
  };
  
  const typeIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const timeAgo = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
    : '';
  
  return (
    <div 
      className={cn(
        "p-3 mb-1 rounded-md cursor-pointer transition-colors flex gap-3",
        notification.read_at 
          ? "hover:bg-muted/50" 
          : "bg-muted/40 hover:bg-muted",
        notification.action_url && "hover:bg-muted"
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-1">
        {typeIcon()}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start">
          <h4 className={cn(
            "text-sm font-medium truncate",
            !notification.read_at && "font-medium"
          )}>
            {notification.title}
          </h4>
          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
        
        {notification.action_label && notification.action_url && (
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                if (!notification.read_at) {
                  markAsRead(notification.id);
                }
                if (onOpenChange) {
                  onOpenChange(false);
                }
                window.location.href = notification.action_url!;
              }}
            >
              {notification.action_label}
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {!notification.read_at && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={handleRead}
            title="Mark as read"
          >
            <Bell className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          onClick={handleDelete}
          title="Remove notification"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationItem;
