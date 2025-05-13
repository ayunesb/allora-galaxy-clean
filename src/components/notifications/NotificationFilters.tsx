
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationFiltersProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  timeFilter: string;
  onTimeFilterChange: (time: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  searchQuery,
  onSearch,
  typeFilter,
  onTypeFilterChange,
  timeFilter,
  onTimeFilterChange,
  isLoading = false,
  onRefresh
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };
  
  const handleClearSearch = () => {
    onSearch('');
  };
  
  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notifications..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        
        {onRefresh && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh notifications</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Tabs value={typeFilter} onValueChange={onTypeFilterChange} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Tabs value={timeFilter} onValueChange={onTimeFilterChange} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationFilters;
