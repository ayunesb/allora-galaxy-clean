
import { DateRange } from '@/components/ui/date-range-picker';

export type SystemEventModule = 
  | 'agent'
  | 'system'
  | 'plugin'
  | 'strategy'
  | 'auth'
  | 'kpi'
  | 'marketing'
  | 'tenant'
  | 'user'
  | string;

export interface FilterState {
  searchTerm?: string;
  dateRange?: DateRange;
  eventType?: string;
  userId?: string;
  [key: string]: any;
}

export interface SystemLogFilter {
  searchTerm?: string;
  module?: string | string[];
  event?: string;
  dateRange?: DateRange;
  tenant?: string;
}

// Add missing type definitions
export type VoteType = 'upvote' | 'downvote';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: React.ComponentType<any>;
  items?: NavigationItem[];
  adminOnly?: boolean;
  badge?: string | number;
}

export type OnboardingStep = 
  | 'welcome'
  | 'company-info'
  | 'persona'
  | 'additional-info'
  | 'strategy-generation'
  | 'complete';

// Tenant type definition
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  settings?: Record<string, any>;
}
