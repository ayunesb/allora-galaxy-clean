
import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  MailOpen,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export interface NotificationItemType {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
  module?: string;
}

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClose
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  const getModuleBadge = (module?: string) => {
    if (!module) return null;
    
    const colors: Record<string, string> = {
      'strategy': 'bg-blue-100 text-blue-800',
      'agent': 'bg-purple-100 text-purple-800',
      'plugin': 'bg-amber-100 text-amber-800',
      'billing': 'bg-green-100 text-green-800',
      'system': 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[module] || 'bg-gray-100 text-gray-800'}`}>
        {module}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const renderNotificationContent = () => (
    <div className={`relative flex gap-4 rounded-lg border p-4 ${notification.isRead ? '' : 'bg-accent'}`}>
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
      )}
      <div className="flex-shrink-0">
        {getTypeIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium">
            {notification.title}
          </h3>
          <div className="flex items-center gap-2">
            {notification.module && getModuleBadge(notification.module)}
            <div className="flex space-x-1">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="h-7 w-7"
                >
                  <MailOpen className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        {notification.description && (
          <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.createdAt)}</p>
      </div>
    </div>
  );

  return notification.link ? (
    <Link to={notification.link} className="block hover:no-underline" onClick={handleClick}>
      {renderNotificationContent()}
    </Link>
  ) : (
    <div className="cursor-default">
      {renderNotificationContent()}
    </div>
  );
};

export default NotificationItem;
