// Shared types used across the application

// Generic type for date ranges
export interface DateRange {
  from?: Date;
  to?: Date;
}

// Generic type for trend direction
export type TrendDirection = 'up' | 'down' | 'neutral';

// Generic type for vote type
export type VoteType = 'upvote' | 'downvote';

// Generic type for user role
export type UserRole = 'admin' | 'user' | 'guest';

// Generic type for system event module
export type SystemEventModule = 
  | 'system' 
  | 'auth' 
  | 'tenant' 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'user' 
  | 'webhook' 
  | 'billing';

// Generic type for system event type
export type SystemEventType = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'executed' 
  | 'error' 
  | 'warning' 
  | 'success' 
  | 'login' 
  | 'logout' 
  | 'invited' 
  | 'role_changed';

// Generic type for KPI trend
export type KPITrend = {
  date: string;
  value: number;
};

// Additional shared types needed by various components
export type NavigationItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
};

export type OnboardingStep = {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
};

export type BaseEntity = {
  id: string;
  created_at?: string;
  updated_at?: string;
};

export type ExecutionType = 'strategy' | 'plugin' | 'agent';
export type ExecutionParams = Record<string, any>;
export type TenantFeature = 'ai_decisions' | 'advanced_analytics' | 'custom_plugins';
