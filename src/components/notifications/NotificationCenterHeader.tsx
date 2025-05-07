
import React from 'react';
import { X, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationCenterHeaderProps {
  markAllAsRead: () => Promise<void>;
  onClose: () => void;
}

const NotificationCenterHeader: React.FC<NotificationCenterHeaderProps> = ({ 
  markAllAsRead, 
  onClose 
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <h2 className="text-sm font-medium">Notifications</h2>
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-8"
          onClick={markAllAsRead}
        >
          <BellOff className="h-3.5 w-3.5 mr-1.5" />
          Mark all read
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
};

export default NotificationCenterHeader;
