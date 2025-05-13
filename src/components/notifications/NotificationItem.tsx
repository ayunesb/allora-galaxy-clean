
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertCircle, Check, Info, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Notification, NotificationType } from '@/types/notifications';
import { Card, CardContent } from '@/components/ui/card';
import { formatRelativeDate } from '@/lib/utils/date';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const { id, title, message, type, read, createdAt, action } = notification;

  const Icon = () => {
    switch (type) {
      case NotificationType.Strategy:
        return <Zap className="h-4 w-4" />;
      case NotificationType.Agent:
        return <Info className="h-4 w-4" />;
      case NotificationType.Error:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case NotificationType.Update:
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`mb-2 ${!read ? 'border-l-4 border-l-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="mt-1">
              <Icon />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{title}</h4>
                {!read && <Badge variant="outline">New</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{message}</p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeDate(new Date(createdAt))}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {action && (
              <Button variant="outline" size="sm" asChild>
                <Link to={action.url}>{action.label}</Link>
              </Button>
            )}
            {!read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(id)}
              >
                Mark Read
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;
