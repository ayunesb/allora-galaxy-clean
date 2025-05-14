
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationCenterContent from '@/components/notifications/NotificationCenterContent';
import { useNotificationData } from '@/hooks/useNotificationData';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { Badge } from '@/components/ui/badge';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { notifications, unreadCount, isLoading } = useNotificationData(activeFilter);
  const { markAsRead, markAllAsRead } = useNotificationActions();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    // If closing the notifications center, mark notifications as read
    if (!open && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-2 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0">
        <NotificationCenterContent 
          notifications={notifications}
          markAsRead={markAsRead}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onMarkAllAsRead={markAllAsRead}
          isLoading={isLoading}
          unreadCount={unreadCount}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
