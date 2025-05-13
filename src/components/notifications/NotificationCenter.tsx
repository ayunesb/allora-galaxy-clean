
import React, { useCallback } from 'react';
import { useNotifications } from '@/lib/notifications/useNotifications';
import NotificationCenterHeader from './NotificationCenterHeader';
import NotificationCenterContent from './NotificationCenterContent';
import NotificationCenterFooter from './NotificationCenterFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  
  const [activeFilter, setActiveFilter] = React.useState('all');
  
  const handleMarkNotificationAsRead = useCallback(async (id: string): Promise<void> => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [markAsRead]);
  
  const handleDeleteNotification = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [deleteNotification]);
  
  const handleMarkAllAsRead = useCallback(async (): Promise<void> => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [markAllAsRead]);

  if (!isOpen) return null;

  return (
    <Card className="shadow-lg border w-[380px] max-w-full flex flex-col max-h-[85vh]">
      <NotificationCenterHeader onClose={onClose} onMarkAllAsRead={handleMarkAllAsRead} />
      
      <ScrollArea className="flex-1 max-h-[500px] overflow-y-auto">
        <NotificationCenterContent 
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          notifications={notifications}
          markAsRead={handleMarkNotificationAsRead}
          onDelete={handleDeleteNotification}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </ScrollArea>
      
      <NotificationCenterFooter onMarkAllAsRead={handleMarkAllAsRead} />
    </Card>
  );
};

export default NotificationCenter;
