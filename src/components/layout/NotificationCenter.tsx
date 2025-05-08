
import { useState, useEffect } from 'react';
import { useNotifications } from '@/lib/notifications/useNotifications';
import NotificationCenterContent from '@/components/notifications/NotificationCenterContent';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refreshNotifications
  } = useNotifications();
  
  // Add local state for isOpen since it's missing from the context
  const [isOpen, setIsOpen] = useState(false);
  
  // Close notification center when Escape key is pressed
  useEffect(() => {
    const handleEscPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscPress);
    return () => {
      window.removeEventListener('keydown', handleEscPress);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string): Promise<void> => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string): Promise<void> => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={`relative hover:bg-accent hover:text-accent-foreground ${className}`}
          onClick={() => setIsOpen(true)}
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        
        <NotificationCenterContent 
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDeleteNotification}
          loading={loading}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
