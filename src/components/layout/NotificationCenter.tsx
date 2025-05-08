
import { useEffect } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { useToast } from '@/hooks/use-toast';
import { NotificationCenterContent } from '@/components/notifications/NotificationCenterContent';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const { isOpen, setIsOpen, unreadCount, markAllAsRead } = useNotificationsContext();
  const { toast } = useToast();

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

  // Close the notification center
  const handleClose = () => {
    setIsOpen(false);
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      if (!result.success) {
        throw result.error || new Error('Failed to mark notifications as read');
      }
      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "default",
      });
      // Return explicitly for void type compatibility
      return;
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
      // Return explicitly for void type compatibility
      return;
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
        <NotificationCenterContent 
          onClose={handleClose}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </SheetContent>
    </Sheet>
  );
};
