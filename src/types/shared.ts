
// System event types
export type SystemEventModule = 
  | 'auth'
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'execution'
  | 'billing'
  | 'admin'
  | 'marketing'
  | 'system'
  | 'user'
  | 'tenant'
  | 'product'
  | 'onboarding'
  | 'security';  // Added security module for audit logs

export type SystemEventType =
  // Strategy events
  | 'execute_strategy_started'
  | 'execute_strategy_completed'
  | 'execute_strategy_error'
  | 'strategy_created'
  | 'strategy_updated'
  | 'strategy_deleted'
  | 'strategy_approved'
  | 'strategy_rejected'
  
  // Plugin events
  | 'plugin_executed'
  | 'plugin_execution_failed'
  | 'plugin_created'
  | 'plugin_updated'
  | 'plugin_deleted'
  
  // Agent events
  | 'agent_created'
  | 'agent_updated'
  | 'agent_deleted'
  | 'agent_evolved'
  | 'agent_vote_recorded'
  
  // User events
  | 'user_login'
  | 'user_logout'
  | 'user_registered'
  | 'user_invited'
  | 'password_reset'
  
  // Tenant events
  | 'tenant_created'
  | 'tenant_updated'
  | 'tenant_deleted'
  | 'member_added'
  | 'member_removed'
  | 'member_role_changed'
  
  // System events
  | 'system_error'
  | 'system_warning'
  | 'system_info'
  | 'error'  // Generic error event
  | 'audit'  // Security audit event
  
  // KPI events
  | 'kpi_updated'
  | 'kpi_update_failed'
  
  // Custom events (allow string literal)
  | string;

// Vote type for agent/content voting
export type VoteType = 'up' | 'down';

// Additional shared types needed for other components
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export type ExecutionType = 'strategy' | 'plugin' | 'agent';
export type ExecutionParams = Record<string, any>;

export interface KPITrend {
  change: number;
  direction: TrendDirection;
  isPositive: boolean;
  percentage?: number;
}

export type LogStatus = 'pending' | 'running' | 'success' | 'error' | 'warning';
export type TrendDirection = 'up' | 'down' | 'flat';
export type UserRole = 'owner' | 'admin' | 'member' | 'guest';
export type TenantFeature = 'ai_strategy' | 'analytics' | 'plugins' | 'multi_user';
