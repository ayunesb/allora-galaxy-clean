
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';

interface FilterOption {
  value: string | null;
  label: string;
}

interface NotificationFiltersProps {
  filter: string | null;
  setFilter: (filter: string | null) => void;
  filterOptions: FilterOption[];
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({ 
  filter, 
  setFilter,
  filterOptions 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-4 w-4" />
          {filter ? `Filter: ${filter}` : 'Filter'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {filterOptions.map((option) => (
          <DropdownMenuItem 
            key={option.value || 'none'} 
            onClick={() => setFilter(option.value)}
            className={filter === option.value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationFilters;
