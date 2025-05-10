
// Strategy related types
import { DateRange } from 'react-day-picker';
import { User } from './user';
import { TrendDirection } from './trends';

export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  created_by?: User;
  approved_by?: User;
  created_at: string;
  updated_at: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  completion_percentage?: number;
  tenant_id: string;
}

export interface StrategyFilter {
  dateRange?: DateRange;
  status?: string;
  priority?: string;
  searchTerm?: string;
}
