
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckIcon, FilterIcon } from 'lucide-react';

export type NotificationType = 'all' | 'system' | 'info' | 'success' | 'warning' | 'error' | 'milestone';

interface NotificationFiltersProps {
  selectedFilter: NotificationType;
  onFilterChange: (filter: NotificationType) => void;
  className?: string;
  filterOptions?: Array<{ value: NotificationType | null; label: string }>;
}

const defaultNotificationTypes: { value: NotificationType; label: string }[] = [
  { value: 'all', label: 'All Notifications' },
  { value: 'system', label: 'System' },
  { value: 'info', label: 'Information' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'milestone', label: 'Milestones' },
];

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  selectedFilter,
  onFilterChange,
  className = '',
  filterOptions = defaultNotificationTypes,
}) => {
  return (
    <div className={`flex items-center justify-end ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <FilterIcon className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {filterOptions.map((type) => (
            <DropdownMenuItem
              key={type.value?.toString() || 'all'}
              onClick={() => onFilterChange(type.value as NotificationType)}
              className="flex items-center justify-between"
            >
              <span>{type.label}</span>
              {selectedFilter === type.value && <CheckIcon className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationFilters;
