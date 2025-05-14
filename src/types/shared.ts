
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type VoteType = 'up' | 'down';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType;
  id?: string;
  requiredRole?: UserRole | UserRole[];
  children?: NavigationItem[];
  items?: NavigationItem[];
  isNew?: boolean;
  isExternal?: boolean;
  badge?: string | number;
}

export enum OnboardingStep {
  WELCOME = 'welcome',
  COMPANY_INFO = 'company_info',
  PERSONA = 'persona',
  ADDITIONAL_INFO = 'additional_info',
  STRATEGY_GENERATION = 'strategy_generation',
  COMPLETE = 'complete'
}

export interface SystemEventModule {
  name: string;
  value: string;
  icon?: React.ComponentType;
}

export interface FilterState {
  searchTerm?: string;
  dateRange?: DateRange;
  module?: string;
  type?: string;
  [key: string]: any;
}

export type SystemEventType = 'info' | 'warning' | 'error' | 'success';

export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  isPositive: boolean;
}

export interface TenantFeature {
  name: string;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface FilterProps {
  filter: FilterState;
  setFilter: (filter: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
}
