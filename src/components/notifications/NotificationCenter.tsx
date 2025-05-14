import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationCenterProps {
  triggerClassName?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ triggerClassName }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={triggerClassName}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <ul>
              {sortedNotifications.map(notification => (
                <li 
                  key={notification.id}
                  className={`p-4 border-b hover:bg-accent/50 cursor-pointer ${!notification.is_read ? 'bg-accent/20' : ''}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{notification.message}</p>
                  
                  {notification.action_url && notification.action_label && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 h-auto p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = notification.action_url || '';
                      }}
                    >
                      {notification.action_label}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
