
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  CheckCircle, 
  Info, 
  AlertCircle, 
  AlertTriangle,
  Trash2,
  Check,
  ExternalLink
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationContent } from './NotificationCenterContent';

export type NotificationItemType = NotificationContent;

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const handleMarkAsRead = () => onMarkAsRead(notification.id);
  const handleDelete = () => onDelete(notification.id);
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const formattedDate = () => {
    try {
      const date = new Date(notification.timestamp);
      const timeAgo = formatDistanceToNow(date, { addSuffix: true });
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground cursor-help">
              {timeAgo}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{format(date, 'PPpp')}</p>
          </TooltipContent>
        </Tooltip>
      );
    } catch (error) {
      return <span className="text-xs text-muted-foreground">Unknown date</span>;
    }
  };
  
  return (
    <Card className={`border-l-4 ${
      notification.type === 'success' ? 'border-l-green-500' :
      notification.type === 'warning' ? 'border-l-amber-500' :
      notification.type === 'error' ? 'border-l-red-500' :
      notification.type === 'system' ? 'border-l-purple-500' :
      'border-l-blue-500'
    } ${notification.read ? 'bg-muted/30' : 'bg-background'}`}>
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <CardTitle className="text-sm font-medium">{notification.title}</CardTitle>
        </div>
        <div className="flex space-x-1">
          {!notification.read && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={handleMarkAsRead}
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Mark as read</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as read</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete notification</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription className={`${notification.read ? 'text-muted-foreground' : ''}`}>
          {notification.message}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {formattedDate()}
        
        {!notification.read && (
          <Badge variant="outline" className="text-xs bg-blue-500/10">
            New
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default NotificationItem;
