
import { Dispatch, SetStateAction } from 'react';

// Date range type for filters
export interface DateRange {
  from: Date;
  to?: Date;
}

// Generic filter state type
export interface FilterState<T = string> {
  searchTerm?: string;
  module?: T;
  dateRange?: DateRange;
}

// Generic filter props type
export interface FilterProps<T = string> {
  onFilterChange: (filters: FilterState<T>) => void;
  filters: FilterState<T>;
  modules?: T[];
}
