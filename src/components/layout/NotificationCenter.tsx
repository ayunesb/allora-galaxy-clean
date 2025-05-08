
import { useEffect } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import NotificationCenterContent from '@/components/notifications/NotificationCenterContent';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const { 
    isOpen, 
    setIsOpen, 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationsContext();
  
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
  }, [isOpen, setIsOpen]);

  const handleMarkAsRead = async (id: string): Promise<void> => {
    await markAsRead(id);
  };

  const handleDeleteNotification = async (id: string): Promise<void> => {
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    await markAllAsRead();
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
