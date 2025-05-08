
// User roles in the application
export type UserRole = 'owner' | 'admin' | 'member' | 'guest';

// Navigation item for sidebar and menus
export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

// Vote types for agent evaluations
export type VoteType = 'upvote' | 'downvote' | 'neutral';

// System event modules
export type SystemEventModule = 
  | 'auth' 
  | 'billing' 
  | 'strategy' 
  | 'agent' 
  | 'plugin' 
  | 'system' 
  | 'marketing'
  | 'product';

// System event types
export type SystemEventType = 
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'kpi_updated'
  | 'kpi_update_failed'
  | 'user_created'
  | 'user_deleted'
  | 'tenant_created'
  | 'execute_strategy_started'
  | 'execute_strategy_completed'
  | 'execute_strategy_error';

// Onboarding steps
export type OnboardingStep = 
  | 'company-info' 
  | 'persona' 
  | 'additional-info' 
  | 'strategy-generation';
