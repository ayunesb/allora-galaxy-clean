
import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationEmptyStateProps {
  selectedTab: string;
  filter: string | null;
  className?: string;
}

const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({ 
  selectedTab,
  filter,
  className 
}) => {
  const getEmptyStateMessage = () => {
    let message = 'No notifications to show';
    
    if (selectedTab === 'unread') {
      message = 'You don\'t have any unread notifications';
    } else if (selectedTab === 'all' && !filter) {
      message = 'You don\'t have any notifications yet';
    } else if (filter) {
      message = `No ${filter} notifications`;
    }
    
    return message;
  };

  return (
    <div className={cn("flex flex-col items-center justify-center h-[300px] text-center p-4", className)}>
      <Info className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-muted-foreground">{getEmptyStateMessage()}</p>
    </div>
  );
};

export default NotificationEmptyState;
