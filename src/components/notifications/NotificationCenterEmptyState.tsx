
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationCenterEmptyStateProps {
  onRefresh?: () => Promise<void>;
}

const NotificationCenterEmptyState: React.FC<NotificationCenterEmptyStateProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No notifications</h3>
      <p className="text-sm text-muted-foreground mb-4">
        You don't have any notifications at the moment.
      </p>
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      )}
    </div>
  );
};

export default NotificationCenterEmptyState;
