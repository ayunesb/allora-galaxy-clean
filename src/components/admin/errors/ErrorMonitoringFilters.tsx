
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Search } from 'lucide-react';
import { LogFilters } from '@/types/logs';

interface ErrorMonitoringFiltersProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

const ErrorMonitoringFilters: React.FC<ErrorMonitoringFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = React.useState(filters.searchTerm || '');
  
  const handleModuleChange = (value: string) => {
    onFiltersChange({ ...filters, module: value as any });
  };
  
  const handleSearch = () => {
    onFiltersChange({ ...filters, searchTerm });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search errors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        
        <Button variant="outline" onClick={handleSearch}>
          Filter
        </Button>
      </div>
      
      <Select value={filters.module as string} onValueChange={handleModuleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Module" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="auth">Auth</SelectItem>
            <SelectItem value="strategy">Strategy</SelectItem>
            <SelectItem value="plugin">Plugin</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRefresh}
        disabled={isLoading}
        className="ml-auto"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default ErrorMonitoringFilters;
