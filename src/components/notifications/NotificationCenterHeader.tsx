
import React from 'react';
import { Bell, X, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenuLabel } from '@/components/ui/dropdown-menu';

interface NotificationCenterHeaderProps {
  markAllAsRead: () => void;
  onClose: () => void;
}

const NotificationCenterHeader: React.FC<NotificationCenterHeaderProps> = ({ 
  markAllAsRead,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-4">
      <DropdownMenuLabel className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        <span>Notifications</span>
      </DropdownMenuLabel>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={markAllAsRead} title="Mark all as read">
          <MailOpen className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationCenterHeader;
