
import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationEmptyStateProps {
  filter: string;
}

const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({ filter }) => {
  const getMessage = () => {
    switch (filter) {
      case 'unread':
        return "You have no unread notifications";
      case 'system':
        return "No system notifications";
      default:
        return "You don't have any notifications yet";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-muted rounded-full p-3 mb-4">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg">{getMessage()}</h3>
      <p className="text-muted-foreground text-center mt-2">
        Notifications about your account and activity will appear here
      </p>
    </div>
  );
};

export default NotificationEmptyState;
