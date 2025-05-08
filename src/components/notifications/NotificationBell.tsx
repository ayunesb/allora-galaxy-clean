
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { Badge } from '@/components/ui/badge';

export interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { unreadCount, isOpen, setIsOpen, refreshNotifications } = useNotificationsContext();
  
  const toggleNotificationCenter = async () => {
    if (!isOpen) {
      // Refresh notifications when opening
      await refreshNotifications();
    }
    setIsOpen(!isOpen);
  };
  
  return (
    <div className={`relative ${className || ''}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleNotificationCenter}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center p-0 text-[0.65rem]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default NotificationBell;
