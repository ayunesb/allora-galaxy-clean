
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenterContent } from '@/components/notifications/NotificationCenterContent';
import { convertToNotificationContent } from '@/types/notifications';

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { 
    notifications,
    markAsRead: originalMarkAsRead,
    markAllAsRead: originalMarkAllAsRead,
    deleteNotification: originalDeleteNotification,
    unreadCount = 0
  } = useNotifications();
  
  // Create wrapper functions that return void to match the expected type
  const markAsRead = async (id: string): Promise<void> => {
    await originalMarkAsRead(id);
    return;
  };
  
  const markAllAsRead = async (): Promise<void> => {
    await originalMarkAllAsRead();
    return;
  };
  
  const deleteNotification = async (id: string): Promise<void> => {
    await originalDeleteNotification(id);
    return;
  };
  
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

export default NotificationCenter;
