
import React from 'react';
import { Bell } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface NotificationEmptyStateProps {
  selectedTab: string;
  filter: string | null;
}

const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({ selectedTab, filter }) => {
  const getMessage = () => {
    let message = `You don't have any${selectedTab === 'unread' ? ' unread' : ''} notifications`;
    if (filter) {
      message += ` related to ${filter}`;
    }
    message += '.';
    return message;
  };

  return (
    <EmptyState
      title="No notifications"
      description={getMessage()}
      icon={<Bell className="h-12 w-12" />}
    />
  );
};

export default NotificationEmptyState;
