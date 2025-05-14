
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/lib/notifications/useNotifications';

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick, className }) => {
  const { unreadCount } = useNotifications();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`relative ${className}`} 
      onClick={onClick}
      aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationBell;
