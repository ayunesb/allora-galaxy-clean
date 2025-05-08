
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationsContext } from '@/context/NotificationsContext';
import NotificationCenterHeader from '../notifications/NotificationCenterHeader';
import NotificationCenterTabs from '../notifications/NotificationCenterTabs';
import NotificationCenterFooter from '../notifications/NotificationCenterFooter';
import { NotificationContent } from '@/types/notifications';

const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotificationsContext();
  const [open, setOpen] = useState(false);

  // Transform Notification[] to NotificationContent[]
  const transformedNotifications: NotificationContent[] = notifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message || notification.description || '',
    timestamp: notification.created_at,
    read: notification.is_read || false,
    type: notification.type,
    action_url: notification.action_url,
    action_label: notification.action_label
  }));

  const handleMarkAsRead = async (id: string) => {
    const result = await markAsRead(id);
    return result;
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    return result;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[380px]" align="end" forceMount>
        <NotificationCenterHeader 
          markAllAsRead={handleMarkAllAsRead} 
          onClose={() => setOpen(false)} 
        />
        <DropdownMenuSeparator />
        
        <NotificationCenterTabs 
          loading={loading}
          notifications={transformedNotifications}
          markAsRead={handleMarkAsRead}
          markAllAsRead={handleMarkAllAsRead}
          onClose={() => setOpen(false)}
          unreadCount={unreadCount}
        />
        
        <DropdownMenuSeparator />
        <NotificationCenterFooter />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
