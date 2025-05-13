
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck } from 'lucide-react';

interface NotificationsPageHeaderProps {
  totalCount: number;
  onMarkAllAsRead: () => Promise<void>;
}

const NotificationsPageHeader: React.FC<NotificationsPageHeaderProps> = ({
  totalCount,
  onMarkAllAsRead
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          You have {totalCount} {totalCount === 1 ? 'notification' : 'notifications'}
        </p>
      </div>
      
      <Button 
        variant="outline" 
        onClick={onMarkAllAsRead}
        disabled={totalCount === 0}
        className="shrink-0"
      >
        <CheckCheck className="mr-2 h-4 w-4" />
        Mark all as read
      </Button>
    </div>
  );
};

export default NotificationsPageHeader;
