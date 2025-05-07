
import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationCenterEmptyStateProps {
  filter: string;
  className?: string;
}

const NotificationCenterEmptyState: React.FC<NotificationCenterEmptyStateProps> = ({ 
  filter,
  className 
}) => {
  const getEmptyStateMessage = (filter: string) => {
    switch (filter) {
      case 'all':
        return 'You don\'t have any notifications yet';
      case 'unread':
        return 'You don\'t have any unread notifications';
      case 'system':
        return 'No system notifications';
      default:
        return 'No notifications to show';
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center h-[300px] text-center p-4", className)}>
      <Info className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-muted-foreground">{getEmptyStateMessage(filter)}</p>
    </div>
  );
};

export default NotificationCenterEmptyState;
