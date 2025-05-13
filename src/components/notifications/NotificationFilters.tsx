
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationType } from '@/types/notifications';

export interface FilterOption {
  value: NotificationType | 'all';
  label: string;
}

interface NotificationFiltersProps {
  selectedFilter: NotificationType | 'all';
  onFilterChange: (filter: NotificationType | 'all') => void;
  filterOptions: FilterOption[];
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  selectedFilter,
  onFilterChange,
  filterOptions
}) => {
  // Find the selected filter label
  const selectedLabel = filterOptions.find(option => option.value === selectedFilter)?.label || 'All Types';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <span>Filter: {selectedLabel}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuRadioGroup value={selectedFilter} onValueChange={(value) => onFilterChange(value as NotificationType | 'all')}>
          {filterOptions.map(option => (
            <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center justify-between">
              {option.label}
              {selectedFilter === option.value && <Check className="h-4 w-4" />}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationFilters;
