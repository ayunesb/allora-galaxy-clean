
import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Info,
  MoreHorizontal,
  Trash2,
  MailOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Notification } from './NotificationCenter';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClose
}) => {
  const {
    id,
    title,
    description,
    type,
    isRead,
    createdAt,
    link
  } = notification;

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getModuleColor = () => {
    switch (notification.module) {
      case 'strategy':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-purple-100 text-purple-800';
      case 'plugin':
        return 'bg-amber-100 text-amber-800';
      case 'billing':
        return 'bg-green-100 text-green-800';
      case 'system':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formattedDate = () => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(id);
    }
    if (onClose) {
      onClose();
    }
  };

  const renderNotificationContent = () => (
    <div className={cn(
      "flex gap-3 p-4 hover:bg-accent cursor-pointer transition-colors",
      !isRead && "bg-accent/50"
    )}>
      <div className="shrink-0">
        {getTypeIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            "text-sm font-medium",
            !isRead && "font-semibold"
          )}>
            {title}
          </h4>
          <div className="flex items-center gap-2">
            {notification.module && (
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                getModuleColor()
              )}>
                {notification.module}
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isRead && (
                  <DropdownMenuItem onClick={() => onMarkAsRead(id)}>
                    <MailOpen className="mr-2 h-4 w-4" />
                    <span>Mark as read</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{formattedDate()}</p>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} onClick={handleClick}>
      {renderNotificationContent()}
    </Link>
  ) : (
    <div onClick={handleClick}>
      {renderNotificationContent()}
    </div>
  );
};

export default NotificationItem;
