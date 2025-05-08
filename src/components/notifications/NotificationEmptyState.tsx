
import React from 'react';
import { BellOff } from 'lucide-react';

interface NotificationEmptyStateProps {
  filter: string;
}

const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({ filter }) => {
  let message = "You have no notifications";
  
  if (filter === "unread") {
    message = "You have no unread notifications";
  } else if (filter === "system") {
    message = "You have no system notifications";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <BellOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium">{message}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        New notifications will appear here
      </p>
    </div>
  );
};

export default NotificationEmptyState;
