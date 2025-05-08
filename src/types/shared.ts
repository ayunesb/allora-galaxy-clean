
export type VoteType = 'upvote' | 'downvote';

export type TrendDirection = 'up' | 'down' | 'flat' | 'neutral';

export type SystemEventModule = 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'auth' 
  | 'billing' 
  | 'marketing'
  | 'onboarding'
  | 'system'
  | 'security';

export type SystemEventType = 'info' | 'warning' | 'error' | 'success';

export type UserRole = 'owner' | 'admin' | 'member' | 'guest';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: NavigationItem[];
  badges?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }[];
}

export type OnboardingStep = 
  | 'welcome'
  | 'company-info'
  | 'persona'
  | 'additional-info'
  | 'strategy-generation';

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExecutionParams {
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  isPositive: boolean;
}

export type LogStatus = 'success' | 'failure' | 'warning' | 'info' | 'error' | 'pending' | 'running';

export interface TenantFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config?: Record<string, any>;
}
