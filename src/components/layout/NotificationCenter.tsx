
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenterContent } from '@/components/notifications/NotificationCenterContent';
import { NotificationContent } from '@/types/notifications';

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
  
  const notificationContents: NotificationContent[] = notifications.map(notification => ({
    id: notification.id,
    title: notification.title || '',
    message: notification.message || '',
    type: (notification.type as any) || 'info', 
    timestamp: notification.created_at,
    read: !!notification.read_at
  }));

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
