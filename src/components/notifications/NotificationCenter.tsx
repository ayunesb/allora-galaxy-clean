
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { Badge } from '@/components/ui/badge';
import NotificationCenterTabs from './NotificationCenterTabs';
import NotificationCenterHeader from './NotificationCenterHeader';

const NotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotificationsContext();

  const handleMarkAsRead = async (id: string) => {
    const result = await markAsRead(id);
    if (result.success) {
      await refreshNotifications();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Wrap markAllAsRead to return void to match the expected type
  const handleMarkAllAsRead = async (): Promise<void> => {
    await markAllAsRead();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-[380px] p-0 max-h-[500px] overflow-hidden"
        sideOffset={5}
      >
        <div className="flex flex-col h-[500px]">
          <NotificationCenterHeader 
            unreadCount={unreadCount} 
            onMarkAllAsRead={handleMarkAllAsRead}
            onClose={handleClose}
          />
          
          <NotificationCenterTabs
            loading={loading}
            notifications={notifications}
            markAsRead={handleMarkAsRead}
            onClose={handleClose}
            unreadCount={unreadCount}
            markAllAsRead={handleMarkAllAsRead}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
