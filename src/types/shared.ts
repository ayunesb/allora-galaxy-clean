
export type SystemEventModule = 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'auth' 
  | 'system' 
  | 'tenant'
  | 'execution'
  | 'user'
  | string;

export type SystemEventType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'executed'
  | 'evolved'
  | 'approved'
  | 'rejected'
  | 'success'
  | 'failure'
  | 'error'
  | 'warning'
  | 'info'
  | string;

export type VoteType = 'upvote' | 'downvote';

export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  tenant_id?: string;
  priority?: string;
  tags?: string[];
  due_date?: string;
  completion_percentage?: number;
}

// Add missing types
export type UserRole = 'admin' | 'owner' | 'member' | 'viewer' | string;

export interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  requiresRole?: UserRole[];
  children?: NavigationItem[];
}

export type TrendDirection = 'up' | 'down' | 'neutral';

export type KPITrend = {
  direction: TrendDirection;
  percentage: number;
  isPositive: boolean;
};

export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
  tenant_id?: string;
  created_by?: string;
}

export type ExecutionParams = Record<string, any>;
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | string;
export type LogStatus = 'success' | 'failure' | 'warning' | 'info';
export type TenantFeature = 'analytics' | 'autoevolution' | 'kpi_tracking' | 'agent_voting' | string;

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  features?: TenantFeature[];
  metadata?: Record<string, any>;
}
