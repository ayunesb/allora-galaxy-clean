
// Add the missing type definitions
export type SystemEventModule = 'strategy' | 'plugin' | 'agent' | 'auth' | 'system' | string;
export type SystemEventType = 'created' | 'updated' | 'deleted' | 'executed' | 'evolved' | 'login' | 'logout' | string;
export type VoteType = 'upvote' | 'downvote' | 'neutral';
export type TrendDirection = 'up' | 'down' | 'neutral';
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
export type NavigationItem = {
  title: string;
  href: string;
  icon?: any;
  requiresRole?: UserRole[];
  children?: NavigationItem[];
};
export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}
export interface ExecutionParams {
  tenantId: string;
  strategyId?: string;
  options?: Record<string, any>;
}
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'manual';
export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  isPositive: boolean;
}
export interface TenantFeature {
  id: string;
  name: string;
  enabled: boolean;
  metadata?: Record<string, any>;
}
export type LogStatus = 'success' | 'failure' | 'warning' | 'info';
export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  owner_id: string;
  metadata?: Record<string, any>;
}
