
import { DateRange } from 'react-day-picker';

// Evolution filter type
export interface EvolutionFilter {
  dateRange?: DateRange;
  type?: string;
  status?: string;
  searchTerm?: string;
}
