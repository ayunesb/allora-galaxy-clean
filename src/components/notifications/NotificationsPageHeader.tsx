
import React from 'react';
import { Button } from '@/components/ui/button';
import { MailOpen, Trash2 } from 'lucide-react';
import NotificationFilters, { FilterOption } from './NotificationFilters';
import { NotificationType } from '@/types/notifications';

interface NotificationsPageHeaderProps {
  filter: NotificationType | 'all';
  setFilter: (filter: NotificationType | 'all') => void;
  onMarkAllAsRead: () => void;
  onDeleteAll: () => void;
}

const NotificationsPageHeader: React.FC<NotificationsPageHeaderProps> = ({
  filter,
  setFilter,
  onMarkAllAsRead,
  onDeleteAll
}) => {
  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'All Types' },
    { value: 'system', label: 'System' },
    { value: 'info', label: 'Information' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'milestone', label: 'Milestone' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">View and manage your notification history</p>
      </div>
      <div className="flex gap-2">
        <NotificationFilters 
          selectedFilter={filter} 
          onFilterChange={setFilter} 
          filterOptions={filterOptions} 
        />
        
        <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
          <MailOpen className="h-4 w-4 mr-1.5" />
          Mark all read
        </Button>
        
        <Button variant="outline" size="sm" onClick={onDeleteAll} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-1.5" />
          Clear all
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPageHeader;
