
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenterContent } from '@/components/notifications/NotificationCenterContent';
import { convertToNotificationContent } from '@/types/notifications';

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { 
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount = 0
  } = useNotifications();
  
  const notificationContents = notifications.map(notification => 
    convertToNotificationContent(notification)
  );

  return (
    <div className="absolute right-0 top-full mt-1 w-80 sm:w-96">
      <NotificationCenterContent 
        notifications={notificationContents}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
        onClose={onClose}
      />
    </div>
  );
}
