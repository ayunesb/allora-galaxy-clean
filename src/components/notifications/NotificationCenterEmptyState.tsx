
import React from 'react';
import { BellOff } from 'lucide-react';

const NotificationCenterEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <BellOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium">No notifications</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
        You don't have any notifications at the moment.
        New notifications will appear here.
      </p>
    </div>
  );
};

export default NotificationCenterEmptyState;
