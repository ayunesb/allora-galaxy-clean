
import React from 'react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Bell, 
  AlertTriangle,
  Trash2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { NotificationContent } from '@/types/notifications';

interface NotificationItemProps {
  notification: NotificationContent;
  onMarkAsRead: (id: string) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;
  compact?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false
}) => {
  const { id, title, message, type, timestamp, read, actionUrl, actionLabel } = notification;
  
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!read) {
      await onMarkAsRead(id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(id);
    }
  };
  
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionUrl) {
      window.open(actionUrl, '_blank');
      if (!read) {
        onMarkAsRead(id);
      }
    }
  };
  
  // Format time in a user-friendly way
  const formattedTime = formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  const exactTime = format(parseISO(timestamp), 'PPpp');
  
  // Determine icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />;
      case 'system':
        return <Bell className="h-5 w-5 text-purple-500 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    }
  };
  
  return (
    <div 
      className={`
        relative px-4 py-3 border-b last:border-b-0 transition-colors
        ${!read ? 'bg-primary/5' : 'hover:bg-accent/50'}
        ${compact ? 'py-2' : 'py-3'}
      `}
      onClick={handleMarkAsRead}
    >
      {!read && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <div className="w-1 h-8 bg-primary rounded-r-full"></div>
        </div>
      )}
      
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className={`text-sm font-medium ${!read ? 'text-primary font-semibold' : ''}`}>
              {title}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                    {formattedTime}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{exactTime}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {message}
          </p>
          
          {actionUrl && actionLabel && (
            <div className="mt-2">
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-primary text-xs"
                onClick={handleActionClick}
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute top-3 right-3 flex gap-1">
        {!read && (
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100" 
            onClick={handleMarkAsRead}
            title="Mark as read"
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        
        {onDelete && (
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100" 
            onClick={handleDelete}
            title="Delete notification"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
