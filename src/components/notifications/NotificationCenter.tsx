
import React, { useState } from 'react';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Check, 
  Trash2, 
  AlertCircle, 
  AlertTriangle,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';

interface NotificationCenterProps {
  triggerClassName?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  triggerClassName 
}) => {
  const [open, setOpen] = useState(false);
  
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    markAllAsRead,
    deleteNotification
  } = useNotificationCenter({
    showToastOnNew: true
  });
  
  const handleClearAll = async () => {
    await markAllAsRead();
  };
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
  };
  
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      
      if (diffSec < 60) {
        return 'just now';
      } else if (diffSec < 3600) {
        const min = Math.floor(diffSec / 60);
        return `${min}m ago`;
      } else if (diffSec < 86400) {
        const hr = Math.floor(diffSec / 3600);
        return `${hr}h ago`;
      } else if (diffSec < 604800) {
        const day = Math.floor(diffSec / 86400);
        return `${day}d ago`;
      } else {
        return format(date, 'MMM d');
      }
    } catch (e) {
      return 'Unknown';
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative ${triggerClassName || ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end" forceMount>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 px-2"
              onClick={handleClearAll}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`
                    relative px-4 py-3 cursor-pointer
                    ${!notification.is_read ? 'bg-primary/5' : ''}
                    hover:bg-accent transition-colors
                  `}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-primary font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      
                      {notification.action_url && notification.action_label && (
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 h-auto p-0 text-primary text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = notification.action_url || '';
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          {notification.action_label}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute top-3 right-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100" 
                      onClick={(e) => handleDelete(notification.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {!notification.is_read && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                      <div className="w-1 h-8 bg-primary rounded-r-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t p-2 flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs w-full" 
            onClick={() => setOpen(false)}
          >
            <X className="h-3 w-3 mr-1" />
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
